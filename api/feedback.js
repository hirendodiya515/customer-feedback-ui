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
      plant_location VARCHAR(255),
      office_location VARCHAR(255),
      annual_capacity VARCHAR(255),
      contact_person VARCHAR(255) NOT NULL,
      representative_name VARCHAR(255),
      representative_mail VARCHAR(255),
      representative_designation VARCHAR(255),
      brl_representative_name VARCHAR(255),
      email VARCHAR(255) NOT NULL,
      product VARCHAR(255),

      -- Quality Ratings (updated)
      thickness_dimension_quality_rating INT DEFAULT 0,
      thickness_dimension_quality_comment TEXT,
      surface_visual_quality_rating INT DEFAULT 0,
      surface_visual_quality_comment TEXT,
      breakages_rating INT DEFAULT 0,
      breakages_comment TEXT,
      edge_grinding_quality_rating INT DEFAULT 0,
      edge_grinding_quality_comment TEXT,
      ar_coating_quality_rating INT DEFAULT 0,
      ar_coating_quality_comment TEXT,
      packing_loading_quality_rating INT DEFAULT 0,
      packing_loading_quality_comment TEXT,
      solar_glass_quality_rating INT DEFAULT 0,
      solar_glass_quality_comment TEXT,
      energy_generation_performance_rating INT DEFAULT 0,
      energy_generation_performance_comment TEXT,
      technical_standards_compliance_rating INT DEFAULT 0,
      technical_standards_compliance_comment TEXT,
      quality_average VARCHAR(10),

      -- Competitiveness & Support Ratings (updated)
      pricing_rating INT DEFAULT 0,
      pricing_comment TEXT,
      delivery_lead_time_rating INT DEFAULT 0,
      delivery_lead_time_comment TEXT,
      after_sales_service_response_rating INT DEFAULT 0,
      after_sales_service_response_comment TEXT,
      support_satisfaction_rating INT DEFAULT 0,
      support_satisfaction_comment TEXT,
      sales_team_approach_rating INT DEFAULT 0,
      sales_team_approach_comment TEXT,
      documentation_accuracy_rating INT DEFAULT 0,
      documentation_accuracy_comment TEXT,

      -- Expectations Ratings
      solar_glass_expectations_rating INT DEFAULT 0,
      solar_glass_expectations_comment TEXT,
      future_use_likelihood_rating INT DEFAULT 0,
      future_use_likelihood_comment TEXT,

      -- Insights
      procured_other_than_borosil VARCHAR(10),
      procurement_reason TEXT,
      expectations TEXT,
      preferred_choice JSONB,
      recommendation VARCHAR(50),
      overall_satisfaction VARCHAR(50),
      suggestion TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Ensure new columns exist on existing table installations
  await client.query(`
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS solar_glass_quality_rating INT DEFAULT 0;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS solar_glass_quality_comment TEXT;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS energy_generation_performance_rating INT DEFAULT 0;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS energy_generation_performance_comment TEXT;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS technical_standards_compliance_rating INT DEFAULT 0;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS technical_standards_compliance_comment TEXT;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS support_satisfaction_rating INT DEFAULT 0;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS support_satisfaction_comment TEXT;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS documentation_accuracy_rating INT DEFAULT 0;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS documentation_accuracy_comment TEXT;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS solar_glass_expectations_rating INT DEFAULT 0;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS solar_glass_expectations_comment TEXT;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS future_use_likelihood_rating INT DEFAULT 0;
    ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS future_use_likelihood_comment TEXT;
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const client = await pool.connect();
  try {
    await ensureTables(client);
    await client.query('BEGIN');

    const payload = req.body;
    const { basicInfo, quality, competitiveness, expectations, others, overallSatisfaction, suggestion, qualityAverage } = payload;

    // Insert feedback
    const feedbackResult = await client.query(
      `INSERT INTO customer_feedback 
        (company_name, plant_location, office_location, annual_capacity, contact_person, 
         representative_name, representative_mail, representative_designation, brl_representative_name, email, product,
         thickness_dimension_quality_rating, thickness_dimension_quality_comment,
         surface_visual_quality_rating, surface_visual_quality_comment,
         breakages_rating, breakages_comment,
         edge_grinding_quality_rating, edge_grinding_quality_comment,
         ar_coating_quality_rating, ar_coating_quality_comment,
         packing_loading_quality_rating, packing_loading_quality_comment,
         solar_glass_quality_rating, solar_glass_quality_comment,
         energy_generation_performance_rating, energy_generation_performance_comment,
         technical_standards_compliance_rating, technical_standards_compliance_comment,
         quality_average, pricing_rating, pricing_comment, delivery_lead_time_rating, delivery_lead_time_comment,
         support_satisfaction_rating, support_satisfaction_comment, sales_team_approach_rating, sales_team_approach_comment,
         documentation_accuracy_rating, documentation_accuracy_comment,
         solar_glass_expectations_rating, solar_glass_expectations_comment,
         future_use_likelihood_rating, future_use_likelihood_comment,
         procured_other_than_borosil, procurement_reason, expectations, preferred_choice, recommendation, overall_satisfaction, suggestion)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51)
       RETURNING id`,
      [
        basicInfo.customerName, basicInfo.plantLocation, basicInfo.officeLocation, basicInfo.annualCapacity, basicInfo.representativeName,
        basicInfo.representativeName, basicInfo.representativeMail, basicInfo.representativeDesignation, basicInfo.brlRepresentativeName || null, basicInfo.representativeMail, 'Borosil Solar Glass',
        quality.thicknessDimensionQuality.rating, quality.thicknessDimensionQuality.comment,
        quality.surfaceVisualQuality.rating, quality.surfaceVisualQuality.comment,
        quality.breakages.rating, quality.breakages.comment,
        quality.edgeGrindingQuality.rating, quality.edgeGrindingQuality.comment,
        quality.arCoatingQuality.rating, quality.arCoatingQuality.comment,
        quality.packingLoadingQuality.rating, quality.packingLoadingQuality.comment,
        quality.solarGlassQuality.rating, quality.solarGlassQuality.comment,
        quality.energyGenerationPerformance.rating, quality.energyGenerationPerformance.comment,
        quality.technicalStandardsCompliance.rating, quality.technicalStandardsCompliance.comment,
        qualityAverage, competitiveness.pricing.rating, competitiveness.pricing.comment, competitiveness.deliveryLeadTime.rating, competitiveness.deliveryLeadTime.comment,
        competitiveness.supportSatisfaction.rating, competitiveness.supportSatisfaction.comment, competitiveness.salesTeamApproach.rating, competitiveness.salesTeamApproach.comment,
        competitiveness.documentationAccuracy.rating, competitiveness.documentationAccuracy.comment,
        expectations.solarGlassExpectations.rating, expectations.solarGlassExpectations.comment,
        expectations.futureUseLikelihood.rating, expectations.futureUseLikelihood.comment,
        others.procuredOtherThanBorosil, others.procurementReason, others.expectations, JSON.stringify(others.preferredChoice), others.recommendation, overallSatisfaction, suggestion
      ]
    );

    const feedbackId = feedbackResult.rows[0].id;

    // Auto-generate CARs for low scores (<= 2) in all updated categories
    const allRatings = [
      { label: 'Quality: Thickness & Dimension', score: quality.thicknessDimensionQuality.rating },
      { label: 'Quality: Surface & Visual', score: quality.surfaceVisualQuality.rating },
      { label: 'Quality: Breakages', score: quality.breakages.rating },
      { label: 'Quality: Edge Grinding', score: quality.edgeGrindingQuality.rating },
      { label: 'Quality: AR Coating', score: quality.arCoatingQuality.rating },
      { label: 'Quality: Packing', score: quality.packingLoadingQuality.rating },
      { label: 'Quality: Solar Glass Quality', score: quality.solarGlassQuality.rating },
      { label: 'Quality: Energy Generation Performance', score: quality.energyGenerationPerformance.rating },
      { label: 'Quality: Technical Standards Compliance', score: quality.technicalStandardsCompliance.rating },
      { label: 'Market: Pricing', score: competitiveness.pricing.rating },
      { label: 'Market: Lead Time', score: competitiveness.deliveryLeadTime.rating },
      { label: 'Market: Support Satisfaction', score: competitiveness.supportSatisfaction.rating },
      { label: 'Market: Sales Team', score: competitiveness.salesTeamApproach.rating },
      { label: 'Market: Documentation Accuracy', score: competitiveness.documentationAccuracy.rating },
      { label: 'Expectations: Solar Glass Expectations', score: expectations.solarGlassExpectations.rating },
      { label: 'Expectations: Future Use Likelihood', score: expectations.futureUseLikelihood.rating },
    ];

    const deadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    for (const item of allRatings) {
      if (item.score > 0 && item.score <= 2) {
        await client.query(
          `INSERT INTO corrective_action_requests 
            (feedback_id, customer_name, issue_description, score, action_owner, deadline, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'Open')`,
          [feedbackId, basicInfo.customerName, `Low rating (${item.score}/5) in ${item.label}`, item.score, 'Sales Head', deadline]
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

