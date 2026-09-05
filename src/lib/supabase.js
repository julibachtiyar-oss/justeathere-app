import { createClient } from '@supabase/supabase-js';
import { initialProducts, initialTransactions } from './initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqjnxqpimpnqabkofxny.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xvkhZrudWFG1UtgPWkLRvw_zNpO3YGE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase tables are ready
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, count: data };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

// Fetch products from Supabase or localStorage fallback
export async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (!error && data && data.length > 0) {
      localStorage.setItem('justeathere_products', JSON.stringify(data));
      return { data, source: 'supabase' };
    }
  } catch (e) {
    console.warn('Error fetching products from Supabase, using local fallback:', e);
  }

  const local = localStorage.getItem('justeathere_products');
  if (local) {
    return { data: JSON.parse(local), source: 'local' };
  }
  return { data: initialProducts, source: 'seed' };
}

// Fetch transactions from Supabase or localStorage fallback
export async function fetchTransactions() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });
    
    if (!error && data && data.length > 0) {
      localStorage.setItem('justeathere_transactions', JSON.stringify(data));
      return { data, source: 'supabase' };
    }
  } catch (e) {
    console.warn('Error fetching transactions from Supabase, using local fallback:', e);
  }

  const local = localStorage.getItem('justeathere_transactions');
  if (local) {
    return { data: JSON.parse(local), source: 'local' };
  }
  return { data: initialTransactions, source: 'seed' };
}

// Create a new transaction
export async function addTransaction(transactionData) {
  let savedData = {
    id: 'tx-' + Date.now(),
    created_at: new Date().toISOString(),
    ...transactionData
  };

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        code: transactionData.code,
        transaction_date: transactionData.transaction_date,
        customer_name: transactionData.customer_name,
        product_name: transactionData.product_name,
        variant: transactionData.variant || '-',
        quantity: Number(transactionData.quantity),
        unit_price: Number(transactionData.unit_price),
        total_price: Number(transactionData.total_price),
        notes: transactionData.notes || ''
      }])
      .select()
      .single();

    if (!error && data) {
      savedData = data;
    }
  } catch (e) {
    console.warn('Could not insert to Supabase, saving to local cache only:', e);
  }

  // Update local storage
  const current = JSON.parse(localStorage.getItem('justeathere_transactions') || '[]');
  const updated = [savedData, ...current.filter(t => t.code !== savedData.code)];
  localStorage.setItem('justeathere_transactions', JSON.stringify(updated));

  return savedData;
}

// Delete transaction
export async function removeTransaction(idOrCode) {
  try {
    await supabase
      .from('transactions')
      .delete()
      .or(`id.eq.${idOrCode},code.eq.${idOrCode}`);
  } catch (e) {
    console.warn('Could not delete from Supabase:', e);
  }

  const current = JSON.parse(localStorage.getItem('justeathere_transactions') || '[]');
  const updated = current.filter(t => t.id !== idOrCode && t.code !== idOrCode);
  localStorage.setItem('justeathere_transactions', JSON.stringify(updated));
  return true;
}

// Auto-seed to Supabase if tables are newly created
export async function seedInitialDataToSupabase() {
  try {
    // Check if products exist
    const { count: prodCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (prodCount === 0) {
      await supabase.from('products').insert(initialProducts.map(p => ({
        name: p.name,
        category: p.category,
        base_price: p.base_price
      })));
    }

    // Check if transactions exist
    const { count: txCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (txCount === 0) {
      await supabase.from('transactions').insert(initialTransactions);
      return { success: true, message: '64 Transaksi berhasil di-seed ke Supabase!' };
    }

    return { success: true, message: 'Database Supabase sudah terisi.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
