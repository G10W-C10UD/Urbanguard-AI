// Seed script — inserts 3 MVP users and all 100 Chennai infrastructure assets
import bcrypt from 'bcryptjs';
import { pool, logger } from '../db.js';

// 3 hardcoded MVP users
const users = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator', phone: '9840000001' },
  { username: 'user', password: 'user123', role: 'citizen', name: 'Chennai Citizen', phone: '9840000002' },
  { username: 'contractor', password: 'contractor123', role: 'contractor', name: 'Field Contractor', phone: '9840000003' },
];

// Helper — random date between two years
function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

// Helper — random last maintained date after installed date
function randomMaintainedDate(installedDate) {
  const installed = new Date(installedDate);
  const now = new Date();
  const d = new Date(installed.getTime() + Math.random() * (now.getTime() - installed.getTime()));
  return d.toISOString().split('T')[0];
}

// All 100 assets with exact coordinates from PRD Section 3.4
const allAssets = [
  // ============ STREET LIGHTS (SL-001 to SL-025) ============
  { id: 'SL-001', type: 'streetlight', name: 'Anna Nagar 3rd Avenue Light', lat: 13.0850, lng: 80.2101, area: 'Anna Nagar', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-002', type: 'streetlight', name: 'T Nagar Main Road Light', lat: 13.0418, lng: 80.2341, area: 'T Nagar', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-003', type: 'streetlight', name: 'Adyar Junction Light', lat: 13.0067, lng: 80.2567, area: 'Adyar', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-004', type: 'streetlight', name: 'Velachery Bypass Light', lat: 12.9815, lng: 80.2180, area: 'Velachery', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-005', type: 'streetlight', name: 'Tambaram East Light', lat: 12.9249, lng: 80.1000, area: 'Tambaram', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-006', type: 'streetlight', name: 'Porur Junction Light', lat: 13.0368, lng: 80.1567, area: 'Porur', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-007', type: 'streetlight', name: 'Nungambakkam High Road Light', lat: 13.0569, lng: 80.2425, area: 'Nungambakkam', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-008', type: 'streetlight', name: 'Egmore Station Light', lat: 13.0784, lng: 80.2620, area: 'Egmore', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-009', type: 'streetlight', name: 'Royapuram Harbour Light', lat: 13.1130, lng: 80.2940, area: 'Royapuram', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-010', type: 'streetlight', name: 'Mylapore Temple Light', lat: 13.0335, lng: 80.2676, area: 'Mylapore', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-011', type: 'streetlight', name: 'Guindy Industrial Light', lat: 13.0067, lng: 80.2206, area: 'Guindy', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-012', type: 'streetlight', name: 'Kodambakkam Bridge Light', lat: 13.0530, lng: 80.2234, area: 'Kodambakkam', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-013', type: 'streetlight', name: 'Perambur Barracks Light', lat: 13.1179, lng: 80.2490, area: 'Perambur', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-014', type: 'streetlight', name: 'Ambattur Industrial Light', lat: 13.1143, lng: 80.1548, area: 'Ambattur', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-015', type: 'streetlight', name: 'Avadi Camp Road Light', lat: 13.1147, lng: 80.1015, area: 'Avadi', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-016', type: 'streetlight', name: 'Chromepet Market Light', lat: 12.9516, lng: 80.1462, area: 'Chromepet', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-017', type: 'streetlight', name: 'Pallavaram Cantonment Light', lat: 12.9675, lng: 80.1495, area: 'Pallavaram', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-018', type: 'streetlight', name: 'Sholinganallur IT Corridor Light', lat: 12.9010, lng: 80.2279, area: 'Sholinganallur', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-019', type: 'streetlight', name: 'OMR Phase 1 Tollway Light', lat: 12.9279, lng: 80.2284, area: 'OMR Phase 1', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-020', type: 'streetlight', name: 'Besant Nagar Beach Light', lat: 13.0002, lng: 80.2707, area: 'Besant Nagar', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-021', type: 'streetlight', name: 'Thiruvanmiyur ECR Light', lat: 12.9827, lng: 80.2685, area: 'Thiruvanmiyur', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-022', type: 'streetlight', name: 'Chetpet Lake Road Light', lat: 13.0717, lng: 80.2395, area: 'Chetpet', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-023', type: 'streetlight', name: 'Kilpauk Medical College Light', lat: 13.0839, lng: 80.2395, area: 'Kilpauk', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-024', type: 'streetlight', name: 'Tondiarpet Market Light', lat: 13.1265, lng: 80.2851, area: 'Tondiarpet', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },
  { id: 'SL-025', type: 'streetlight', name: 'Washermanpet Junction Light', lat: 13.1116, lng: 80.2857, area: 'Washermanpet', unit: 'watts', expected: 100, lifespan: 10, installRange: [2014, 2022] },

  // ============ ROADS (RD-001 to RD-025) ============
  { id: 'RD-001', type: 'road', name: 'GST Road Corridor', lat: 12.9716, lng: 80.1914, area: 'GST Road', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-002', type: 'road', name: 'Anna Salai Main', lat: 13.0617, lng: 80.2596, area: 'Anna Salai', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-003', type: 'road', name: 'Rajiv Gandhi Salai (OMR)', lat: 12.9279, lng: 80.2284, area: 'Rajiv Gandhi Salai', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-004', type: 'road', name: 'Mount Road Central', lat: 13.0487, lng: 80.2525, area: 'Mount Road', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-005', type: 'road', name: 'Poonamallee High Road', lat: 13.0653, lng: 80.2001, area: 'Poonamallee High Road', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-006', type: 'road', name: 'Jawaharlal Nehru Road', lat: 13.0784, lng: 80.2620, area: 'Jawaharlal Nehru Road', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-007', type: 'road', name: 'Arcot Road Stretch', lat: 13.0425, lng: 80.1985, area: 'Arcot Road', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-008', type: 'road', name: 'Velachery Main Road', lat: 12.9815, lng: 80.2180, area: 'Velachery', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-009', type: 'road', name: '100 Feet Road Adyar', lat: 13.0067, lng: 80.2567, area: 'Adyar', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-010', type: 'road', name: 'ECR Sholinganallur Stretch', lat: 12.9010, lng: 80.2513, area: 'Sholinganallur', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-011', type: 'road', name: 'Ambattur Industrial Road', lat: 13.1143, lng: 80.1548, area: 'Ambattur', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-012', type: 'road', name: 'Perambur Barracks Road', lat: 13.1179, lng: 80.2490, area: 'Perambur', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-013', type: 'road', name: 'Nungambakkam High Road', lat: 13.0569, lng: 80.2425, area: 'Nungambakkam', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-014', type: 'road', name: 'Kodambakkam High Road', lat: 13.0530, lng: 80.2234, area: 'Kodambakkam', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-015', type: 'road', name: 'Old Mahabalipuram Road', lat: 12.9516, lng: 80.2277, area: 'Old Mahabalipuram', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-016', type: 'road', name: 'Guindy-Kathipara Flyover Road', lat: 13.0067, lng: 80.2206, area: 'Guindy', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-017', type: 'road', name: 'Saidapet Bridge Road', lat: 13.0198, lng: 80.2237, area: 'Saidapet', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-018', type: 'road', name: 'Pallavaram-Thoraipakkam Road', lat: 12.9675, lng: 80.1980, area: 'Pallavaram', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-019', type: 'road', name: 'Porur Junction Road', lat: 13.0368, lng: 80.1567, area: 'Porur', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-020', type: 'road', name: 'Tambaram Bypass Road', lat: 12.9249, lng: 80.1140, area: 'Tambaram', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-021', type: 'road', name: 'Tondiarpet Main Road', lat: 13.1265, lng: 80.2851, area: 'Tondiarpet', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-022', type: 'road', name: 'Basin Bridge Road', lat: 13.1002, lng: 80.2850, area: 'Basin Bridge', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-023', type: 'road', name: 'Thiruvanmiyur Coastal Road', lat: 12.9827, lng: 80.2685, area: 'Thiruvanmiyur', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-024', type: 'road', name: 'Koyambedu Link Road', lat: 13.0701, lng: 80.1986, area: 'Koyambedu', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },
  { id: 'RD-025', type: 'road', name: 'Vadapalani Main Road', lat: 13.0522, lng: 80.2122, area: 'Vadapalani', unit: 'score', expected: 80, lifespan: 15, installRange: [2010, 2020] },

  // ============ WATER PIPELINES (WP-001 to WP-025) ============
  { id: 'WP-001', type: 'waterpipe', name: 'Anna Nagar West Pipeline', lat: 13.0900, lng: 80.2050, area: 'Anna Nagar West', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-002', type: 'waterpipe', name: 'T Nagar North Pipeline', lat: 13.0500, lng: 80.2350, area: 'T Nagar', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-003', type: 'waterpipe', name: 'Adyar River Zone Pipeline', lat: 13.0020, lng: 80.2520, area: 'Adyar', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-004', type: 'waterpipe', name: 'Velachery Lake Zone Pipeline', lat: 12.9760, lng: 80.2210, area: 'Velachery', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-005', type: 'waterpipe', name: 'Tambaram Main Pipeline', lat: 12.9200, lng: 80.1050, area: 'Tambaram', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-006', type: 'waterpipe', name: 'Porur Lake Zone Pipeline', lat: 13.0320, lng: 80.1520, area: 'Porur', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-007', type: 'waterpipe', name: 'Nungambakkam Pipeline', lat: 13.0530, lng: 80.2430, area: 'Nungambakkam', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-008', type: 'waterpipe', name: 'Egmore Supply Line', lat: 13.0750, lng: 80.2600, area: 'Egmore', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-009', type: 'waterpipe', name: 'Royapuram Trunk Pipeline', lat: 13.1100, lng: 80.2960, area: 'Royapuram', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-010', type: 'waterpipe', name: 'Mylapore Grid Pipeline', lat: 13.0380, lng: 80.2660, area: 'Mylapore', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-011', type: 'waterpipe', name: 'Guindy Industrial Pipeline', lat: 13.0050, lng: 80.2220, area: 'Guindy', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-012', type: 'waterpipe', name: 'Kodambakkam Grid Pipeline', lat: 13.0500, lng: 80.2250, area: 'Kodambakkam', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-013', type: 'waterpipe', name: 'Perambur Zone Pipeline', lat: 13.1200, lng: 80.2450, area: 'Perambur', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-014', type: 'waterpipe', name: 'Ambattur Zone Pipeline', lat: 13.1100, lng: 80.1580, area: 'Ambattur', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-015', type: 'waterpipe', name: 'Avadi Zone Pipeline', lat: 13.1200, lng: 80.1020, area: 'Avadi', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-016', type: 'waterpipe', name: 'Chromepet Zone Pipeline', lat: 12.9550, lng: 80.1490, area: 'Chromepet', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-017', type: 'waterpipe', name: 'Pallavaram Zone Pipeline', lat: 12.9700, lng: 80.1520, area: 'Pallavaram', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-018', type: 'waterpipe', name: 'Sholinganallur IT Pipeline', lat: 12.9050, lng: 80.2260, area: 'Sholinganallur', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-019', type: 'waterpipe', name: 'OMR Zone Pipeline', lat: 12.9300, lng: 80.2260, area: 'OMR', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-020', type: 'waterpipe', name: 'Besant Nagar Zone Pipeline', lat: 13.0040, lng: 80.2700, area: 'Besant Nagar', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-021', type: 'waterpipe', name: 'Thiruvanmiyur Zone Pipeline', lat: 12.9870, lng: 80.2700, area: 'Thiruvanmiyur', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-022', type: 'waterpipe', name: 'Chetpet Zone Pipeline', lat: 13.0750, lng: 80.2400, area: 'Chetpet', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-023', type: 'waterpipe', name: 'Kilpauk Zone Pipeline', lat: 13.0820, lng: 80.2400, area: 'Kilpauk', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-024', type: 'waterpipe', name: 'Tondiarpet Zone Pipeline', lat: 13.1300, lng: 80.2820, area: 'Tondiarpet', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },
  { id: 'WP-025', type: 'waterpipe', name: 'Washermanpet Zone Pipeline', lat: 13.1150, lng: 80.2850, area: 'Washermanpet', unit: 'LPM', expected: 150, lifespan: 25, installRange: [2008, 2018] },

  // ============ SEWER LINES (SW-001 to SW-025) ============
  { id: 'SW-001', type: 'sewer', name: 'Anna Nagar Sewer Main', lat: 13.0870, lng: 80.2120, area: 'Anna Nagar', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-002', type: 'sewer', name: 'T Nagar Sewer Line', lat: 13.0450, lng: 80.2360, area: 'T Nagar', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-003', type: 'sewer', name: 'Adyar Sewer Trunk', lat: 13.0040, lng: 80.2590, area: 'Adyar', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-004', type: 'sewer', name: 'Velachery Sewer Line', lat: 12.9830, lng: 80.2200, area: 'Velachery', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-005', type: 'sewer', name: 'Tambaram Sewer Main', lat: 12.9270, lng: 80.1020, area: 'Tambaram', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-006', type: 'sewer', name: 'Porur Sewer Line', lat: 13.0350, lng: 80.1590, area: 'Porur', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-007', type: 'sewer', name: 'Nungambakkam Sewer', lat: 13.0550, lng: 80.2420, area: 'Nungambakkam', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-008', type: 'sewer', name: 'Egmore Sewer Main', lat: 13.0800, lng: 80.2640, area: 'Egmore', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-009', type: 'sewer', name: 'Royapuram Sewer Trunk', lat: 13.1150, lng: 80.2920, area: 'Royapuram', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-010', type: 'sewer', name: 'Mylapore Sewer Line', lat: 13.0360, lng: 80.2690, area: 'Mylapore', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-011', type: 'sewer', name: 'Guindy Sewer Network', lat: 13.0080, lng: 80.2190, area: 'Guindy', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-012', type: 'sewer', name: 'Kodambakkam Sewer Line', lat: 13.0540, lng: 80.2200, area: 'Kodambakkam', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-013', type: 'sewer', name: 'Perambur Sewer Main', lat: 13.1160, lng: 80.2500, area: 'Perambur', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-014', type: 'sewer', name: 'Ambattur Sewer Line', lat: 13.1160, lng: 80.1530, area: 'Ambattur', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-015', type: 'sewer', name: 'Avadi Sewer Main', lat: 13.1130, lng: 80.1030, area: 'Avadi', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-016', type: 'sewer', name: 'Chromepet Sewer Line', lat: 12.9530, lng: 80.1480, area: 'Chromepet', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-017', type: 'sewer', name: 'Pallavaram Sewer Main', lat: 12.9690, lng: 80.1510, area: 'Pallavaram', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-018', type: 'sewer', name: 'Sholinganallur Sewer Line', lat: 12.9030, lng: 80.2270, area: 'Sholinganallur', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-019', type: 'sewer', name: 'OMR Sewer Main', lat: 12.9290, lng: 80.2270, area: 'OMR', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-020', type: 'sewer', name: 'Besant Nagar Sewer Line', lat: 13.0010, lng: 80.2720, area: 'Besant Nagar', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-021', type: 'sewer', name: 'Thiruvanmiyur Sewer Trunk', lat: 12.9850, lng: 80.2700, area: 'Thiruvanmiyur', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-022', type: 'sewer', name: 'Chetpet Sewer Line', lat: 13.0730, lng: 80.2410, area: 'Chetpet', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-023', type: 'sewer', name: 'Kilpauk Sewer Main', lat: 13.0840, lng: 80.2410, area: 'Kilpauk', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-024', type: 'sewer', name: 'Tondiarpet Sewer Trunk', lat: 13.1280, lng: 80.2840, area: 'Tondiarpet', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
  { id: 'SW-025', type: 'sewer', name: 'Washermanpet Sewer Line', lat: 13.1130, lng: 80.2870, area: 'Washermanpet', unit: 'm³/hour', expected: 50, lifespan: 30, installRange: [2005, 2016] },
];

async function seedUsers(client) {
  const existingUsers = await client.query('SELECT COUNT(*) FROM users');
  if (parseInt(existingUsers.rows[0].count) > 0) {
    logger.info('Users already seeded — skipping');
    return;
  }

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    await client.query(
      `INSERT INTO users (username, password_hash, role, name, phone) VALUES ($1, $2, $3, $4, $5)`,
      [user.username, hash, user.role, user.name, user.phone]
    );
  }
  logger.info('Seeded 3 MVP users (admin, user, contractor)');
}

async function seedAssets(client) {
  const existingAssets = await client.query('SELECT COUNT(*) FROM assets');
  if (parseInt(existingAssets.rows[0].count) > 0) {
    logger.info('Assets already seeded — skipping');
    return;
  }

  const currentYear = new Date().getFullYear();

  for (const asset of allAssets) {
    const installedDate = randomDate(asset.installRange[0], asset.installRange[1]);
    const lastMaintained = randomMaintainedDate(installedDate);
    const installYear = new Date(installedDate).getFullYear();
    const age = currentYear - installYear;

    // Calculate age factor (capped at 1.0)
    const ageFactor = Math.min(age / asset.lifespan, 1.0);

    // Weather factor for current month (April = Summer)
    const month = new Date().getMonth() + 1;
    let weatherFactor = 0.1;
    if (month >= 6 && month <= 9) {
      weatherFactor = (asset.type === 'road' || asset.type === 'sewer') ? 0.9 : 0.3;
    } else if (month >= 3 && month <= 5) {
      weatherFactor = asset.type === 'streetlight' ? 0.8 : 0.2;
    } else if (month >= 10 && month <= 12) {
      weatherFactor = 0.7;
    }

    // Risk score formula from PRD
    const riskScore = ((ageFactor * 0.4) + (weatherFactor * 0.4) + (0.1 * 0.2)) * 100;
    const riskLevel = riskScore <= 33 ? 'low' : riskScore <= 66 ? 'medium' : 'high';

    // Predicted failure date
    const monthsRemaining = Math.max(0, (1 - ageFactor) * asset.lifespan * 12);
    const predictedFailure = new Date();
    predictedFailure.setMonth(predictedFailure.getMonth() + Math.round(monthsRemaining));

    // Initial IoT reading (healthy — slight variance)
    const variance = (Math.random() * 0.06 - 0.03); // ±3%
    const sensorReading = parseFloat((asset.expected * (1 + variance)).toFixed(2));
    const deviation = parseFloat((((asset.expected - sensorReading) / asset.expected) * 100).toFixed(2));
    const absDeviation = Math.abs(deviation);
    const status = absDeviation < 5 ? 'healthy' : absDeviation <= 20 ? 'warning' : 'critical';
    const healthScore = Math.max(0, Math.round(100 - absDeviation * 2 - riskScore * 0.3));

    // Binary search segment readings (10 segments, all at expected for now)
    const segments = Array(10).fill(asset.expected);

    await client.query(
      `INSERT INTO assets (
        id, type, name, lat, lng, area, status, health_score,
        installed_date, expected_lifespan_years, last_maintained,
        iot_sensor_reading, iot_expected_reading, iot_unit, iot_deviation_percent, iot_last_updated,
        binary_faulty_index, binary_segment_readings,
        anomaly_age_factor, anomaly_weather_factor, anomaly_risk_score, anomaly_risk_level, anomaly_predicted_failure,
        social_media_flags, complaint_count, complaint_score, job_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14, $15, NOW(),
        $16, $17,
        $18, $19, $20, $21, $22,
        0, 0, 0, 'none'
      )`,
      [
        asset.id, asset.type, asset.name, asset.lat, asset.lng, asset.area, status, healthScore,
        installedDate, asset.lifespan, lastMaintained,
        sensorReading, asset.expected, asset.unit, absDeviation,
        null, JSON.stringify(segments),
        parseFloat(ageFactor.toFixed(4)), parseFloat(weatherFactor.toFixed(4)),
        parseFloat(riskScore.toFixed(2)), riskLevel, predictedFailure.toISOString().split('T')[0],
      ]
    );
  }

  logger.info('Seeded all 100 Chennai infrastructure assets');
}

// 15 realistic Chennai infrastructure complaints for seed data
const seedComplaintsData = [
  { id: 'CMP-00001', name: 'Ravi Kumar', phone: '9841234567', area: 'Anna Nagar', asset_type: 'streetlight', asset_id: 'SL-001', description: 'Street light on 3rd Avenue has been completely off for the past 5 days. The entire stretch is very dark at night making it unsafe for pedestrians.', severity: 'severe', ai_severity: 'severe', ai_confidence: 92, ai_urgency: 'immediate', ai_requires_dispatch: true, ai_key_issues: ['complete_outage', 'safety_hazard', 'pedestrian_risk'], ai_reasoning: 'Complete streetlight failure on a main pedestrian avenue creates immediate safety risk.', status: 'open' },
  { id: 'CMP-00002', name: 'Priya Shankar', phone: '9842345678', area: 'T Nagar', asset_type: 'road', asset_id: 'RD-002', description: 'Large pothole near Panagal Park junction on Anna Salai. Multiple vehicles have been damaged. Pothole is approximately 2 feet wide and growing.', severity: 'severe', ai_severity: 'severe', ai_confidence: 95, ai_urgency: 'immediate', ai_requires_dispatch: true, ai_key_issues: ['pothole', 'vehicle_damage', 'growing_defect'], ai_reasoning: 'Large growing pothole at a major junction with reported vehicle damage requires immediate attention.', status: 'in_review' },
  { id: 'CMP-00003', name: 'Meena Devi', phone: '9843456789', area: 'Adyar', asset_type: 'waterpipe', asset_id: 'WP-003', description: 'Water pipeline leak near Adyar River bridge. Water has been leaking for 3 days continuously. Road is waterlogged and traffic is affected.', severity: 'severe', ai_severity: 'severe', ai_confidence: 90, ai_urgency: 'immediate', ai_requires_dispatch: true, ai_key_issues: ['pipeline_leak', 'waterlogging', 'traffic_disruption'], ai_reasoning: 'Continuous 3-day pipeline leak causing road waterlogging and traffic disruption is critical.', status: 'open' },
  { id: 'CMP-00004', name: 'Karthik Raj', phone: '9844567890', area: 'Velachery', asset_type: 'sewer', asset_id: 'SW-004', description: 'Sewer overflow near Velachery Lake. Foul smell spreading across the residential area. Children and elderly residents are affected.', severity: 'severe', ai_severity: 'severe', ai_confidence: 93, ai_urgency: 'immediate', ai_requires_dispatch: true, ai_key_issues: ['sewer_overflow', 'health_hazard', 'residential_impact'], ai_reasoning: 'Sewer overflow affecting residential area with vulnerable populations needs immediate response.', status: 'open' },
  { id: 'CMP-00005', name: 'Sunita Patel', phone: '9845678901', area: 'Tambaram', asset_type: 'streetlight', asset_id: 'SL-005', description: 'Streetlight near Tambaram East railway crossing is flickering constantly. Creates disorienting effect for drivers at night.', severity: 'moderate', ai_severity: 'moderate', ai_confidence: 85, ai_urgency: 'within_24hrs', ai_requires_dispatch: false, ai_key_issues: ['flickering', 'driver_distraction'], ai_reasoning: 'Flickering near railway crossing is a moderate safety concern for drivers.', status: 'open' },
  { id: 'CMP-00006', name: 'Ganesh Murthy', phone: '9846789012', area: 'Porur', asset_type: 'road', asset_id: 'RD-019', description: 'Road surface near Porur Junction is severely cracked. Multiple speed-breaker like bumps have formed. Buses are unable to pass smoothly.', severity: 'moderate', ai_severity: 'moderate', ai_confidence: 88, ai_urgency: 'within_24hrs', ai_requires_dispatch: true, ai_key_issues: ['road_cracks', 'bus_route_affected', 'surface_deterioration'], ai_reasoning: 'Cracked road affecting bus routes needs repair within 24 hours.', status: 'in_review' },
  { id: 'CMP-00007', name: 'Lakshmi Narayan', phone: '9847890123', area: 'Nungambakkam', asset_type: 'waterpipe', asset_id: 'WP-007', description: 'Low water pressure in Nungambakkam area for the past week. We are barely getting any water during morning hours.', severity: 'moderate', ai_severity: 'moderate', ai_confidence: 80, ai_urgency: 'within_24hrs', ai_requires_dispatch: false, ai_key_issues: ['low_pressure', 'supply_disruption'], ai_reasoning: 'Week-long low water pressure affecting daily supply is a moderate issue.', status: 'open' },
  { id: 'CMP-00008', name: 'Arun Prakash', phone: '9848901234', area: 'Egmore', asset_type: 'streetlight', asset_id: 'SL-008', description: 'Streetlight pole near Egmore Station is leaning at dangerous angle. Looks like it could fall any time especially during strong winds.', severity: 'severe', ai_severity: 'severe', ai_confidence: 96, ai_urgency: 'immediate', ai_requires_dispatch: true, ai_key_issues: ['structural_danger', 'fall_risk', 'public_safety'], ai_reasoning: 'Leaning pole near a busy station is an immediate structural danger to public.', status: 'open' },
  { id: 'CMP-00009', name: 'Deepa Krishnan', phone: '9849012345', area: 'Mylapore', asset_type: 'sewer', asset_id: 'SW-010', description: 'Manhole cover missing on sewer line near Mylapore temple. Very dangerous for pedestrians especially at night. Already one person fell partially.', severity: 'severe', ai_severity: 'severe', ai_confidence: 97, ai_urgency: 'immediate', ai_requires_dispatch: true, ai_key_issues: ['missing_cover', 'fall_hazard', 'pedestrian_injury'], ai_reasoning: 'Missing manhole cover with reported incident is highest priority safety issue.', status: 'in_review' },
  { id: 'CMP-00010', name: 'Vijay Kumar', phone: '9840123456', area: 'Guindy', asset_type: 'road', asset_id: 'RD-016', description: 'Road marking and lane dividers completely faded near Kathipara flyover. Causing confusion during peak hours.', severity: 'minor', ai_severity: 'minor', ai_confidence: 82, ai_urgency: 'within_week', ai_requires_dispatch: false, ai_key_issues: ['faded_markings', 'lane_confusion'], ai_reasoning: 'Faded road markings are a minor maintenance issue to be scheduled.', status: 'open' },
  { id: 'CMP-00011', name: 'Revathi Sundaram', phone: '9841234500', area: 'Kodambakkam', asset_type: 'waterpipe', asset_id: 'WP-012', description: 'Rusty water coming through taps in Kodambakkam Grid area. Water has a yellowish color and metallic taste. Not safe for drinking.', severity: 'moderate', ai_severity: 'severe', ai_confidence: 88, ai_urgency: 'immediate', ai_requires_dispatch: true, ai_key_issues: ['water_contamination', 'health_risk', 'pipe_corrosion'], ai_reasoning: 'Contaminated water supply is a public health emergency requiring immediate investigation.', status: 'open' },
  { id: 'CMP-00012', name: 'Balaji Raman', phone: '9842345600', area: 'Perambur', asset_type: 'streetlight', asset_id: 'SL-013', description: 'Three consecutive streetlights on Perambur Barracks Road are not working. Area becomes very dark creating security concerns.', severity: 'moderate', ai_severity: 'moderate', ai_confidence: 87, ai_urgency: 'within_24hrs', ai_requires_dispatch: true, ai_key_issues: ['multiple_outage', 'security_concern', 'dark_stretch'], ai_reasoning: 'Multiple consecutive outages creating a dark stretch is a moderate security concern.', status: 'open' },
  { id: 'CMP-00013', name: 'Kamala Devi', phone: '9843456700', area: 'Ambattur', asset_type: 'sewer', asset_id: 'SW-014', description: 'Sewer line in Ambattur Industrial Estate is partially blocked. Water draining very slowly during rains. Mosquito breeding concern.', severity: 'moderate', ai_severity: 'moderate', ai_confidence: 84, ai_urgency: 'within_24hrs', ai_requires_dispatch: false, ai_key_issues: ['partial_blockage', 'slow_drainage', 'mosquito_breeding'], ai_reasoning: 'Partial sewer blockage with mosquito breeding risk needs attention within 24 hours.', status: 'resolved' },
  { id: 'CMP-00014', name: 'Senthil Kumar', phone: '9844567800', area: 'Sholinganallur', asset_type: 'road', asset_id: 'RD-010', description: 'Speed breaker on ECR near Sholinganallur is too high and unmarked. Several vehicles have scraped their undercarriage.', severity: 'minor', ai_severity: 'minor', ai_confidence: 78, ai_urgency: 'within_week', ai_requires_dispatch: false, ai_key_issues: ['unmarked_speedbreaker', 'vehicle_damage'], ai_reasoning: 'Unmarked speed breaker is a minor issue that can be resolved with painting and signage.', status: 'resolved' },
  { id: 'CMP-00015', name: 'Anitha Lakshmi', phone: '9845678900', area: 'Besant Nagar', asset_type: 'waterpipe', asset_id: 'WP-020', description: 'Water supply timing is irregular in Besant Nagar. Sometimes water comes at 3 AM instead of scheduled 6 AM. Very inconvenient for residents.', severity: 'minor', ai_severity: 'minor', ai_confidence: 75, ai_urgency: 'low', ai_requires_dispatch: false, ai_key_issues: ['irregular_timing', 'schedule_deviation'], ai_reasoning: 'Irregular water timing is a low priority scheduling issue.', status: 'open' },
];

async function seedComplaints(client) {
  const existingComplaints = await client.query('SELECT COUNT(*) FROM complaints');
  if (parseInt(existingComplaints.rows[0].count) > 0) {
    logger.info('Complaints already seeded — skipping');
    return;
  }

  for (const c of seedComplaintsData) {
    await client.query(
      `INSERT INTO complaints (
        id, name, phone, area, asset_type, asset_id, description, severity,
        ai_severity, ai_confidence, ai_urgency, ai_requires_dispatch, ai_key_issues, ai_reasoning,
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        $15, NOW() - INTERVAL '${Math.floor(Math.random() * 14) + 1} days', NOW()
      )`,
      [
        c.id, c.name, c.phone, c.area, c.asset_type, c.asset_id, c.description, c.severity,
        c.ai_severity, c.ai_confidence, c.ai_urgency, c.ai_requires_dispatch,
        JSON.stringify(c.ai_key_issues), c.ai_reasoning, c.status,
      ]
    );

    // Update asset complaint_count
    if (c.asset_id) {
      const severityScore = c.severity === 'severe' ? 30 : c.severity === 'moderate' ? 15 : 5;
      await client.query(
        `UPDATE assets SET complaint_count = complaint_count + 1, complaint_score = complaint_score + $1 WHERE id = $2`,
        [severityScore, c.asset_id]
      );
    }
  }

  logger.info('Seeded 15 complaints with AI classifications');
}

const seedJobsData = [
  {
    id: 'JOB-00001',
    asset_id: 'SL-007',
    asset_type: 'streetlight',
    area: 'Nungambakkam',
    fault_description: 'Binary search isolated fault at Unit #14 of 20. Power consumption dropped 35% below expected. Immediate replacement required.',
    severity: 'critical',
    estimated_pay: 1500,
    status: 'completed',
    notification_text: 'Critical street light fault in Nungambakkam. Unit #14 completely failed. Pay: ₹1,500. Quick repair needed.',
    dispatched_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'JOB-00002',
    asset_id: 'RD-004',
    asset_type: 'road',
    area: 'Mount Road',
    fault_description: 'Road surface stress sensor detected 29% deviation. Binary search identified damage in segment 8. Pothole repair needed.',
    severity: 'critical',
    estimated_pay: 12000,
    status: 'in_progress',
    notification_text: 'Critical road damage on Mount Road. Sensor deviation 29%. Pay: ₹12,000. High priority repair.',
    dispatched_at: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: 'JOB-00003',
    asset_id: 'WP-003',
    asset_type: 'waterpipe',
    area: 'Adyar',
    fault_description: 'Pipeline flow dropped 24.5% below expected. Binary search identified leak in segment 17. Immediate repair needed.',
    severity: 'critical',
    estimated_pay: 8000,
    status: 'assigned',
    notification_text: 'Water pipe leak in Adyar. Flow deviation 24.5%. Pay: ₹8,000. Residents affected.',
    dispatched_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'JOB-00004',
    asset_id: 'SW-002',
    asset_type: 'sewer',
    area: 'T Nagar',
    fault_description: 'Sewer overflow reported by 3 citizens. Flow volume dropped 40%. Blockage in main line near T Nagar bus stand.',
    severity: 'critical',
    estimated_pay: 6000,
    status: 'open',
    notification_text: 'Sewer blockage emergency in T Nagar. Multiple citizen complaints. Pay: ₹6,000. Act fast.',
    dispatched_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'JOB-00005',
    asset_id: 'SL-013',
    asset_type: 'streetlight',
    area: 'Perambur',
    fault_description: 'Three consecutive street lights non-functional. IoT reading shows 30% power loss across the cluster.',
    severity: 'warning',
    estimated_pay: 800,
    status: 'open',
    notification_text: 'Street light cluster fault in Perambur. 3 units down. Pay: ₹800. Quick fix.',
    dispatched_at: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'JOB-00006',
    asset_id: 'RD-009',
    asset_type: 'road',
    area: 'Adyar',
    fault_description: 'Major pothole reported on 100 Feet Road. Surface stress index dropped to 37. Vehicle damage reported by citizens.',
    severity: 'critical',
    estimated_pay: 12000,
    status: 'open',
    notification_text: 'Critical pothole repair in Adyar. 100 Feet Road damaged. Pay: ₹12,000. Multiple complaints.',
    dispatched_at: new Date(Date.now() - 20 * 60000).toISOString()
  },
  {
    id: 'JOB-00007',
    asset_id: 'WP-006',
    asset_type: 'waterpipe',
    area: 'Porur',
    fault_description: 'Underground pipe leak causing road wetness near Porur junction. Flow deviation 22%. Needs immediate sealing.',
    severity: 'warning',
    estimated_pay: 3000,
    status: 'en_route',
    notification_text: 'Water pipe leak near Porur junction. Road flooding risk. Pay: ₹3,000.',
    dispatched_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'JOB-00008',
    asset_id: 'SW-014',
    asset_type: 'sewer',
    area: 'Ambattur',
    fault_description: 'Missing manhole cover on Ambattur industrial road. Extreme safety hazard. Immediate replacement required.',
    severity: 'critical',
    estimated_pay: 6000,
    status: 'open',
    notification_text: 'URGENT: Missing manhole cover in Ambattur. Safety hazard. Pay: ₹6,000. Immediate response needed.',
    dispatched_at: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

async function seedJobs(client) {
  const existingJobs = await client.query('SELECT COUNT(*) FROM jobs');
  if (parseInt(existingJobs.rows[0].count) > 0) {
    logger.info('Jobs already seeded — skipping');
    return;
  }

  const contractorRes = await client.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['contractor']);
  const contractorId = contractorRes.rows.length > 0 ? contractorRes.rows[0].id : null;

  for (const job of seedJobsData) {
    const acceptedBy = ['assigned', 'en_route', 'in_progress', 'completed'].includes(job.status) ? contractorId : null;
    const acceptedAt = acceptedBy ? job.dispatched_at : null;

    await client.query(
      `INSERT INTO jobs (
        id, asset_id, asset_type, area, fault_description, severity, estimated_pay, notification_text, status, dispatched_at, accepted_by, accepted_at, completed_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )`,
      [
        job.id, job.asset_id, job.asset_type, job.area, job.fault_description, job.severity,
        job.estimated_pay, job.notification_text, job.status, job.dispatched_at, acceptedBy, acceptedAt, job.completed_at || null
      ]
    );

    let jobStatus = job.status;
    if (jobStatus === 'completed') jobStatus = 'none';
    
    if (jobStatus !== 'none') {
      await client.query('UPDATE assets SET job_status = $1 WHERE id = $2', [jobStatus, job.asset_id]);
    }
  }

  logger.info('Seeded 8 initial jobs');
}

export async function runSeed() {
  const client = await pool.connect();
  try {
    await seedUsers(client);
    await seedAssets(client);
    await seedComplaints(client);
    await seedJobs(client);
    logger.info('Seed completed successfully');
  } catch (err) {
    logger.error('Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}
