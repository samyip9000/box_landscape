export const calculateNet = (entries) => {
  const totalDebits = entries
    .filter(entry => entry.type === 'debit')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const totalCredits = entries
    .filter(entry => entry.type === 'credit')
    .reduce((sum, entry) => sum + entry.amount, 0);
  return totalDebits - totalCredits;
};

export const isJournalBalanced = (entries) => {
  const net = calculateNet(entries);
  return Math.abs(net) < 0.01;
};

export const updateAccountBalances = (balances, entries) => {
  const newBalances = { ...balances };
  entries.forEach(entry => {
    const currentBalance = newBalances[entry.account] || 0;
    if (entry.type === 'debit') {
      newBalances[entry.account] = currentBalance + entry.amount;
    } else {
      newBalances[entry.account] = currentBalance - entry.amount;
    }
  });
  return newBalances;
};