// Vercel serverless function — writes customer feedback directly to NeonDB
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create tables if they don't exist
async function ensureTables(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS customer_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      product VARCHAR(255),
      quality_rating INT NOT NULL,
      delivery_rating INT NOT NULL,
      packaging_rating INT NOT NULL,
      support_rating INT NOT NULL,
      response_rating INT NOT NULL,
      complaint_rating INT NOT NULL,
      documentation_rating INT NOT NULL,
      overall_rating INT NOT NULL,
      recommendation VARCHAR(50),
      suggestion TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS corrective_action_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      feedback_id UUID REFERENCES customer_feedback(id) ON DELETE CASCADE,
      customer_name VARCHAR(255),
      issue_description VARCHAR(255),
      score INT,
      action_owner VARCHAR(255),
      deadline TIMESTAMP,
      status VARCHAR(50) DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

export default async function handler(req, res) {
  // Allow CORS from any origin (Vercel frontend)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const client = await pool.connect();
  try {
    await ensureTables(client);
    await client.query('BEGIN');

    const {
      companyName, contactPerson, email, product,
      qualityRating, deliveryRating, packagingRating,
      supportRating, responseRating, complaintRating,
      documentationRating, overallRating,
      recommendation, suggestion
    } = req.body;

    // Insert feedback
    const feedbackResult = await client.query(
      `INSERT INTO customer_feedback 
        (company_name, contact_person, email, product, quality_rating, delivery_rating, packaging_rating, 
         support_rating, response_rating, complaint_rating, documentation_rating, overall_rating, recommendation, suggestion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [companyName, contactPerson, email, product || '',
       qualityRating, deliveryRating, packagingRating,
       supportRating, responseRating, complaintRating,
       documentationRating, overallRating,
       recommendation || '', suggestion || '']
    );

    const feedbackId = feedbackResult.rows[0].id;

    // Auto-generate CARs for low scores (<= 2)
    const ratings = {
      'Quality': qualityRating,
      'Delivery': deliveryRating,
      'Packaging': packagingRating,
      'Support': supportRating,
      'Response Time': responseRating,
      'Complaint Handling': complaintRating,
      'Documentation': documentationRating,
      'Overall': overallRating,
    };

    const deadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // +15 days

    for (const [category, score] of Object.entries(ratings)) {
      if (Number(score) <= 2) {
        await client.query(
          `INSERT INTO corrective_action_requests 
            (feedback_id, customer_name, issue_description, score, action_owner, deadline, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'Open')`,
          [feedbackId, companyName, `Low rating (${score}) in ${category}`, Number(score), 'Sales Head', deadline]
        );
      }
    }

    await client.query('COMMIT');
    return res.status(201).json({ success: true, id: feedbackId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving feedback:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
}
