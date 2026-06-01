import { supabase } from '../supabaseClient';

const DISPLAY_CATEGORY_NAME_MAP = {
  '식품': '식료품',
  '생활용품': '생필품',
  '화장품': '화장품',
};

const CATEGORY_NAME_MAP = {
  '식료품': '식품',
  '생필품': '생활용품',
  '화장품': '화장품',
};

const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('로그인이 필요합니다.');

  return data.user;
};

export const fetchWishlistPlaces = async () => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('places')
    .select('id, name, place_type')
    .eq('user_id', user.id)
    .order('id', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchWishlistProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      brand,
      unit,
      categories (name)
    `)
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map(product => ({
    id: product.id,
    name: product.name,
    brand: product.brand || '',
    unit: product.unit || '개',
    category: DISPLAY_CATEGORY_NAME_MAP[product.categories?.name] || product.categories?.name || '',
  }));
};

export const fetchWishlistItems = async () => {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      id,
      desired_quantity,
      status,
      created_at,
      places (id, name, place_type),
      products (
        id,
        name,
        brand,
        unit,
        categories (name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    placeId: item.places?.id,
    place: item.places?.place_type,
    placeName: item.places?.name || '',
    productId: item.products?.id,
    name: item.products?.name || '',
    brand: item.products?.brand || '',
    unit: item.products?.unit || '개',
    category: DISPLAY_CATEGORY_NAME_MAP[item.products?.categories?.name] || item.products?.categories?.name || '',
    desiredQuantity: Number(item.desired_quantity) || 0,
    status: item.status,
    checked: item.status === 'purchased',
  }));
};

export const addWishlistItem = async ({ placeId, productId, desiredQuantity }) => {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from('wishlist_items')
    .upsert({
      user_id: user.id,
      place_id: Number(placeId),
      product_id: Number(productId),
      desired_quantity: Number(desiredQuantity) || 1,
      status: 'active',
    }, {
      onConflict: 'user_id,place_id,product_id,status',
    });

  if (error) throw error;
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

const getOrCreateWishlistProduct = async ({ name, brand, category, unit }) => {
  const categoryData = await getCategory(category);
  const productName = name.trim();
  const productBrand = brand?.trim() || null;

  let query = supabase
    .from('products')
    .select('id')
    .eq('name', productName)
    .eq('category_id', categoryData.id)
    .limit(1);

  query = productBrand ? query.eq('brand', productBrand) : query.is('brand', null);

  const { data: existing, error: readError } = await query.maybeSingle();

  if (readError) throw readError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('products')
    .insert({
      category_id: categoryData.id,
      name: productName,
      brand: productBrand,
      unit: unit || '개',
      is_food: categoryData.name === '식품',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
};

export const addNewProductWishlistItem = async ({
  placeId,
  name,
  brand,
  category,
  unit,
  desiredQuantity,
}) => {
  if (!name?.trim()) throw new Error('상품 이름을 입력해주세요.');

  const product = await getOrCreateWishlistProduct({
    name,
    brand,
    category,
    unit,
  });

  await addWishlistItem({
    placeId,
    productId: product.id,
    desiredQuantity,
  });
};

export const updateWishlistItemStatus = async ({ id, status }) => {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from('wishlist_items')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};
