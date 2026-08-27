const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Create a new form schema
router.post('/create', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });
    
    const { headers, dashboardName } = req.body;
    if (!headers || !Array.isArray(headers)) {
      return res.status(400).json({ error: 'Headers array is required' });
    }

    const { data, error } = await supabase
      .from('shared_forms')
      .insert([{ headers, dashboard_name: dashboardName }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, formId: data.id, createdAt: data.created_at });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: error.message || 'Failed to create form' });
  }
});

// Get a form schema by ID
router.get('/:id', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });

    const { id } = req.params;
    const { data, error } = await supabase
      .from('shared_forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Form not found' });
      }
      throw error;
    }

    res.json({ success: true, form: data });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch form' });
  }
});

// Submit a form
router.post('/:id/submit', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });

    const { id } = req.params;
    const { data } = req.body; // Array of values matching the headers

    if (!data) return res.status(400).json({ error: 'Form data is required' });

    const { error } = await supabase
      .from('form_submissions')
      .insert([{ form_id: id, data }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: error.message || 'Failed to submit form' });
  }
});

// Get all new submissions for a form
// We will optionally filter by a timestamp or just get all for the demo.
router.get('/:id/submissions', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });

    const { id } = req.params;
    const { since } = req.query; // ISO timestamp to only get new ones

    let query = supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', id)
      .order('created_at', { ascending: true });

    if (since) {
      query = query.gt('created_at', since);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, submissions: data });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch submissions' });
  }
});

module.exports = router;
