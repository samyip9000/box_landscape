export const liabilityAccounts = [
  { name: 'Credit Card Debt', position: [8, 0, 2], scale: 1.2 },
  { name: 'Bank Loan', position: [8, 0, -2], scale: 1.5 },
  { name: 'Accounts Payable', position: [4, 0, -2], scale: 1.0 },
  { name: 'Mortgage', position: [4, 0, 2], scale: 1.8 },
  { name: 'Tax Payable', position: [6, 0, 0], scale: 1.3 },
  { name: 'Accrued Expenses', position: [6, 0, -4], scale: 0.9 },
  { name: 'Short-term Debt', position: [4, 0, 0], scale: 1.1 },
];

export const assetAccounts = [
  { name: 'Cash Account', position: [-4, 0, 4], scale: 1.4 },
  { name: 'Savings Account', position: [-8, 0, 2], scale: 1.6 },
  { name: 'Inventory', position: [-8, 0, -2], scale: 1.2 },
  { name: 'Equipment', position: [-6, 0, 0], scale: 1.5 },
  { name: 'Real Estate', position: [-4, 0, 2], scale: 1.8 },
  { name: 'Investments', position: [-4, 0, -2], scale: 1.3 },
];

export const initialAccountBalances = {
  // Liability accounts
  'Credit Card Debt': 0,
  'Bank Loan': 0,
  'Accounts Payable': 0,
  'Mortgage': 0,
  'Tax Payable': 0,
  'Accrued Expenses': 0,
  'Short-term Debt': 0,
  // Asset accounts
  'Cash Account': 0,
  'Savings Account': 0,
  'Inventory': 0,
  'Equipment': 0,
  'Real Estate': 0,
  'Investments': 0,
};