import { supabase } from '../supabaseClient';

const CATEGORY_NAME_MAP = {
  '식료품': '식품',
  '생필품': '생활용품',
  '화장품': '화장품',
};

const DISPLAY_CATEGORY_NAME_MAP = {
  '식품': '식료품',
  '생활용품': '생필품',
  '화장품': '화장품',
};

const RECEIPT_BUCKET = 'receipt-images';

const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('로그인이 필요합니다.');

  return data.user;
};

const getPlace = async ({ userId, selectedPlace, placeId }) => {
  if (placeId && Number.isInteger(Number(placeId))) {
    const { data, error } = await supabase
      .from('places')
      .select('id, name, place_type')
      .eq('user_id', userId)
      .eq('id', Number(placeId))
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  if (!selectedPlace?.id && !selectedPlace?.name) return null;

  if (selectedPlace?.id) {
    const { data, error } = await supabase
      .from('places')
      .select('id, name, place_type')
      .eq('user_id', userId)
      .eq('place_type', selectedPlace.id)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  if (selectedPlace?.name) {
    const { data, error } = await supabase
      .from('places')
      .select('id, name, place_type')
      .eq('user_id', userId)
      .eq('name', selectedPlace.name)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  if (!selectedPlace) return null;

  const { data: createdPlace, error: createError } = await supabase
    .from('places')
    .insert({
      user_id: userId,
      name: selectedPlace.name,
      place_type: selectedPlace.id || null,
    })
    .select('id, name, place_type')
    .single();

  if (createError?.code === '23505') {
    const { data, error } = await supabase
      .from('places')
      .select('id, name, place_type')
      .eq('user_id', userId)
      .eq('name', selectedPlace.name)
      .single();

    if (error) throw error;
    return data;
  }

  if (createError) throw createError;
  return createdPlace;
};

const getLatestPurchaseByProductId = async ({ userId, productIds }) => {
  if (productIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('purchase_order_items')
    .select(`
      id,
      purchase_order_id,
      product_id,
      unit_price,
      line_total,
      purchase_orders (
        purchased_at,
        stores (name)
      )
    `)
    .eq('user_id', userId)
    .in('product_id', productIds);

  if (error) throw error;

  return (data || []).reduce((latestByProductId, item) => {
    const current = latestByProductId.get(item.product_id);
    const currentDate = current?.purchase_orders?.purchased_at || '';
    const nextDate = item.purchase_orders?.purchased_at || '';

    if (!current || nextDate > currentDate) {
      latestByProductId.set(item.product_id, item);
    }

    return latestByProductId;
  }, new Map());
};

const normalizeInventoryItem = ({ inventory, latestPurchase }) => {
  const product = inventory.products || {};
  const category = product.categories?.name || '';
  const unitPrice = Number(latestPurchase?.unit_price || 0);
  const quantity = Number(inventory.current_quantity) || 0;

  return {
    id: inventory.id,
    productId: inventory.product_id,
    placeId: inventory.place_id,
    latestPurchaseOrderId: latestPurchase?.purchase_order_id || null,
    latestPurchaseOrderItemId: latestPurchase?.id || null,
    category: DISPLAY_CATEGORY_NAME_MAP[category] || category,
    name: product.name || '',
    brand: product.brand || '',
    place: inventory.places?.place_type || inventory.place_id,
    date: latestPurchase?.purchase_orders?.purchased_at?.slice(0, 10) || inventory.updated_at?.slice(0, 10) || '',
    shop: latestPurchase?.purchase_orders?.stores?.name || '',
    quantity,
    price: unitPrice * quantity,
    unit: product.unit || '개',
    unitPrice: unitPrice ? `${unitPrice.toLocaleString()}원/1${product.unit || '개'}` : '',
  };
};

export const fetchInventory = async (selectedPlaceOrId) => {
  const user = await getCurrentUser();
  const selectedPlace = typeof selectedPlaceOrId === 'object' ? selectedPlaceOrId : null;
  const place = await getPlace({
    userId: user.id,
    selectedPlace,
    placeId: typeof selectedPlaceOrId === 'object' ? null : selectedPlaceOrId,
  });

  if (!place) return [];

  const { data, error } = await supabase
    .from('inventories')
    .select(`
      id,
      place_id,
      product_id,
      current_quantity,
      updated_at,
      places (id, name, place_type),
      products (
        id,
        name,
        brand,
        unit,
        low_stock_threshold,
        is_food,
        categories (name)
      )
    `)
    .eq('user_id', user.id)
    .eq('place_id', place.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const productIds = [...new Set((data || []).map((item) => item.product_id))];
  const latestPurchaseByProductId = await getLatestPurchaseByProductId({
    userId: user.id,
    productIds,
  });

  return (data || []).map((inventory) => normalizeInventoryItem({
    inventory,
    latestPurchase: latestPurchaseByProductId.get(inventory.product_id),
  }));
};

const getOrCreateStore = async (name) => {
  if (!name) return null;

  const { data: existing, error: readError } = await supabase
    .from('stores')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('stores')
    .insert({ name })
    .select('id')
    .single();

  if (error) throw error;
  return data;
};

const getCategory = async (categoryName) => {
  const dbCategoryName = CATEGORY_NAME_MAP[categoryName] || categoryName;
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .eq('name', dbCategoryName)
    .single();

  if (error) throw error;
  return data;
};

const getOrCreateProduct = async (item) => {
  const category = await getCategory(item.category);
  const name = item.name.trim();

  let query = supabase
    .from('products')
    .select('id, name, brand, unit')
    .eq('name', name)
    .eq('category_id', category.id);

  if (item.brand?.trim()) {
    query = query.eq('brand', item.brand.trim());
  }

  const { data: existing, error: readError } = await query.maybeSingle();

  if (readError) throw readError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('products')
    .insert({
      category_id: category.id,
      name,
      brand: item.brand?.trim() || null,
      unit: item.unit || '개',
      is_food: category.name === '식품',
    })
    .select('id, name, brand, unit')
    .single();

  if (error) throw error;
  return data;
};

const getReceiptExtension = (file) => {
  const fileExtension = file.name?.split('.').pop()?.toLowerCase();
  if (fileExtension && /^[a-z0-9]+$/.test(fileExtension)) return fileExtension;

  const mimeExtension = file.type?.split('/')[1]?.toLowerCase();
  return mimeExtension === 'jpeg' ? 'jpg' : mimeExtension || 'jpg';
};

const uploadReceiptImage = async ({ file, userId, purchasedAt }) => {
  if (!file) return null;

  const purchasedYear = purchasedAt?.slice(0, 4) || new Date().getFullYear().toString();
  const extension = getReceiptExtension(file);
  const objectPath = `${userId}/${purchasedYear}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .upload(objectPath, file, {
      cacheControl: '3600',
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`영수증 이미지 저장 실패: ${error.message}`);
  }

  return objectPath;
};

const removeReceiptImage = async (objectPath) => {
  if (!objectPath) return;

  const { error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .remove([objectPath]);

  if (error) {
    console.error('영수증 이미지 정리 실패:', error);
  }
};

export const createInventoryItems = async ({
  items,
  commonData,
  selectedPlace,
  receiptFile,
}) => {
  const user = await getCurrentUser();
  const place = await getPlace({ userId: user.id, selectedPlace });

  if (!place) {
    throw new Error('선택한 장소를 Supabase places 테이블에서 찾지 못했습니다.');
  }

  const store = await getOrCreateStore(commonData.shop?.trim());
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
  const receiptImagePath = await uploadReceiptImage({
    file: receiptFile,
    userId: user.id,
    purchasedAt: commonData.purchasedAt,
  });

  const { data: purchaseOrder, error: orderError } = await supabase
    .from('purchase_orders')
    .insert({
      user_id: user.id,
      place_id: place.id,
      store_id: store?.id || null,
      purchased_at: commonData.purchasedAt,
      total_amount: totalAmount,
      receipt_image_path: receiptImagePath,
    })
    .select('id')
    .single();

  if (orderError) {
    await removeReceiptImage(receiptImagePath);
    throw orderError;
  }

  for (const item of items) {
    const product = await getOrCreateProduct(item);
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const lineTotal = Number(item.lineTotal) || quantity * unitPrice;

    const { data: purchaseOrderItem, error: itemError } = await supabase
      .from('purchase_order_items')
      .insert({
        user_id: user.id,
        purchase_order_id: purchaseOrder.id,
        product_id: product.id,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      })
      .select('id')
      .single();

    if (itemError) throw itemError;

    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        user_id: user.id,
        product_id: product.id,
        place_id: place.id,
        movement_type: 'IN',
        quantity,
        moved_at: commonData.purchasedAt,
        purchase_order_item_id: purchaseOrderItem.id,
        note: '상품 등록 입고',
      });

    if (movementError) throw movementError;

    const { data: inventory } = await supabase
      .from('inventories')
      .select('id, current_quantity')
      .eq('user_id', user.id)
      .eq('place_id', place.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (inventory) {
      const { error: updateError } = await supabase
        .from('inventories')
        .update({
          current_quantity: Number(inventory.current_quantity) + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inventory.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('inventories')
        .insert({
          user_id: user.id,
          place_id: place.id,
          product_id: product.id,
          current_quantity: quantity,
        });

      if (insertError) throw insertError;
    }
  }

  return fetchInventory(selectedPlace);
};

export const updateInventoryItem = async ({ item, updates, selectedPlace }) => {
  const user = await getCurrentUser();
  const quantity = Number(updates.quantity);

  if (!updates.name?.trim()) {
    throw new Error('상품 이름을 입력해주세요.');
  }

  if (Number.isNaN(quantity) || quantity < 0) {
    throw new Error('수량은 0 이상으로 입력해주세요.');
  }

  const { error: inventoryError } = await supabase
    .from('inventories')
    .update({
      current_quantity: quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', item.id)
    .eq('user_id', user.id);

  if (inventoryError) throw inventoryError;

  const { error: productError } = await supabase
    .from('products')
    .update({
      name: updates.name.trim(),
      brand: updates.brand?.trim() || null,
    })
    .eq('id', item.productId);

  if (productError) throw productError;

  if (item.latestPurchaseOrderId) {
    const store = await getOrCreateStore(updates.shop?.trim());

    const { error: orderError } = await supabase
      .from('purchase_orders')
      .update({
        store_id: store?.id || null,
      })
      .eq('id', item.latestPurchaseOrderId)
      .eq('user_id', user.id);

    if (orderError) throw orderError;
  }

  return fetchInventory(selectedPlace);
};

export const deleteInventoryItems = async ({ itemIds, selectedPlace }) => {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from('inventories')
    .delete()
    .in('id', itemIds)
    .eq('user_id', user.id);

  if (error) throw error;

  return fetchInventory(selectedPlace);
};

export const consumeInventoryItem = async ({ item, amount = 1, selectedPlace }) => {
  const user = await getCurrentUser();
  const consumeAmount = Number(amount) || 1;

  if (consumeAmount <= 0) {
    throw new Error('소진 수량은 1 이상이어야 합니다.');
  }

  const { data: inventory, error: readError } = await supabase
    .from('inventories')
    .select('id, current_quantity, product_id, place_id')
    .eq('id', item.id)
    .eq('user_id', user.id)
    .single();

  if (readError) throw readError;

  const currentQuantity = Number(inventory.current_quantity) || 0;
  const nextQuantity = Math.max(currentQuantity - consumeAmount, 0);
  const actualConsumed = currentQuantity - nextQuantity;

  if (actualConsumed <= 0) {
    throw new Error('이미 재고가 0입니다.');
  }

  const { error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      user_id: user.id,
      product_id: inventory.product_id,
      place_id: inventory.place_id,
      movement_type: 'OUT',
      quantity: actualConsumed,
      moved_at: new Date().toISOString(),
      purchase_order_item_id: item.latestPurchaseOrderItemId || null,
      note: '수량 소진',
    });

  if (movementError) throw movementError;

  const { error: updateError } = await supabase
    .from('inventories')
    .update({
      current_quantity: nextQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inventory.id)
    .eq('user_id', user.id);

  if (updateError) throw updateError;

  return fetchInventory(selectedPlace);
};
