/** Normalize demo query aliases without changing the user's visible question. */
export function normalizeFinanceQuestion(query: string): string {
  return query
    .replace(/south\s+china\s+branch/gi, "华南分公司")
    .replace(/east\s+china\s+branch/gi, "华东分公司")
    .replace(/north\s+china\s+branch/gi, "华北分公司")
    .replace(/entire\s+group|whole\s+group|all\s+(?:of\s+the\s+)?group|group[- ]wide/gi, "全集团")
    .replace(/operating\s+profit/gi, "营业利润")
    .replace(/total\s+profit/gi, "利润总额")
    .replace(/net\s+profit/gi, "净利润")
    .replace(/profit/gi, "利润")
    .replace(/(?:fourth\s+quarter|quarter\s*4|q4)/gi, "四季度")
    .replace(/(?:third\s+quarter|quarter\s*3|q3)/gi, "三季度")
    .replace(/(?:second\s+quarter|quarter\s*2|q2)/gi, "二季度")
    .replace(/(?:first\s+quarter|quarter\s*1|q1)/gi, "一季度")
    .replace(/\bwhy\b|\bcauses?\b|\breasons?\b/gi, "为什么")
    .replace(/compar(?:ison|ing|ed|e)(?:\s+(?:to|with))?/gi, "比")
    .replace(/growth|increase|grew|grow/gi, "增长")
    .replace(/branch/gi, "分公司");
}
