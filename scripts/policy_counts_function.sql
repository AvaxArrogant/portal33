-- Create a function to get policy counts by customer
CREATE OR REPLACE FUNCTION get_customer_policy_counts()
RETURNS TABLE(customer_id uuid, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    policies.customer_id, 
    COUNT(policies.id)::bigint as count
  FROM 
    policies
  WHERE 
    policies.customer_id IS NOT NULL
  GROUP BY 
    policies.customer_id;
END;
$$ LANGUAGE plpgsql;
