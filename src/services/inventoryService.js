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

  let query = supabase
    .from('places')
    .select('id, name, place_type')
    .eq('user_id', userId);

  if (selectedPlace?.id) {
    query = query.eq('place_type', selectedPlace.id);
  } else {
    query = query.eq('name', selectedPlace.name);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;

  if (data || !selectedPlace) return data;

  const { data: createdPlace, error: createError } = await supabase
    .from('places')
    .insert({
      user_id: userId,
      name: selectedPlace.name,
      place_type: selectedPlace.id || null,
    })
    .select('id, name, place_type')
    .single();

  if (createError) throw createError;
  return createdPlace;
};

const getLatestPurchaseByProductId = async ({ userId, productIds }) => {
  if (productIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('purchase_order_items')
    .select(`
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

export const createInventoryItems = async ({ items, commonData, selectedPlace }) => {
  const user = await getCurrentUser();
  const place = await getPlace({ userId: user.id, selectedPlace });

  if (!place) {
    throw new Error('선택한 장소를 Supabase places 테이블에서 찾지 못했습니다.');
  }

  const store = await getOrCreateStore(commonData.shop?.trim());
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);

  const { data: purchaseOrder, error: orderError } = await supabase
    .from('purchase_orders')
    .insert({
      user_id: user.id,
      place_id: place.id,
      store_id: store?.id || null,
      purchased_at: commonData.purchasedAt,
      total_amount: totalAmount,
    })
    .select('id')
    .single();

  if (orderError) throw orderError;

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
