export function calculateResult(answers: string[]): string {
  const counts: Record<string, number> = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0,
  };

  for (const answer of answers) {
    if (answer in counts) {
      counts[answer]++;
    }
  }

  const e_i = counts.E >= counts.I ? 'E' : 'I';
  const s_n = counts.S >= counts.N ? 'S' : 'N';
  const t_f = counts.T >= counts.F ? 'T' : 'F';
  const j_p = counts.J >= counts.P ? 'J' : 'P';

  return `${e_i}${s_n}${t_f}${j_p}`;
}
