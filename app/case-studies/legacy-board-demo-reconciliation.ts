const snapshot = "#F8FAFF";
const dark = "#2A3542";
const groupCards = [
  { amount: 1200.89, priorYear: 1000, priorMonth: 1150 },
  { amount: 48.2, priorYear: 45, priorMonth: 50 },
  { amount: 36.75, priorYear: 32, priorMonth: 35 },
];
const amountLabel = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const change = (amount: number, base: number) => {
  const ratio = (amount / base - 1) * 100;
  return (ratio >= 0 ? "+" : "") + ratio.toFixed(2) + "%";
};

const estateTaxes = [
  { label: "增值税及附加", amount: 903.33, color: "#4D92DB" },
  { label: "消费税及附加", amount: 102.77, color: "#00A9BB" },
  { label: "企业所得税", amount: 88.94, color: "#7867DC" },
  { label: "个人所得税", amount: 51.91, color: "#C57B00" },
  { label: "印花税", amount: 36.73, color: "#E06956" },
  { label: "其它", amount: 23.06, color: "#368C6E" },
];
const estateTotal = estateTaxes.reduce((sum, item) => sum + item.amount, 0);
const consumptionShare = (estateTaxes[1].amount / estateTotal * 100).toFixed(2);

export const reconciliationEdits = {
  "tax-cloud/10-redesign-new-home": {
    w: 1920, h: 1080, patches: [
      { box: [1018, 608, 77, 15], background: "#F9FBFF", text: ["示例人数（人）"], size: 9, color: "#5B6676", align: "center" },
    ],
  },
  "tax-cloud/09-redesign-card-scenes": {
    w: 1920, h: 1080, patches: [
      { box: [74, 231, 236, 19], background: "#F2F6FE", text: ["多企业（集团）卡片库 · 示例数据"], size: 16, color: "#4A5668" },
      ...groupCards.flatMap((item, index) => {
        const top = 323 + 94 * index;
        return [
          { box: [85, top, 88, 18], background: snapshot, text: [amountLabel.format(item.amount)], size: 14, weight: 600, color: dark, inset: 5 },
          { box: [79, top + 25, 103, 27], background: snapshot, text: [
            "同比 " + change(item.amount, item.priorYear) + " · 环比 " + change(item.amount, item.priorMonth),
          ], size: 7.5, color: dark, inset: 3 },
        ];
      }),
    ],
  },
  "data-visualisation/02-multi-industry-dashboard": {
    w: 1920, h: 1080, patches: [
      { box: [1009, 151, 167, 77], background: "#102D53", radius: 4 },
      { box: [1016, 155, 155, 26], text: ["2023 出口退税 · 万元"], size: 14, color: "#C8E4FF", align: "center" },
      { box: [1016, 185, 155, 40], text: ["549"], size: 32, weight: 650, color: "#63DFF3", align: "center" },
      { box: [1224, 151, 167, 77], background: "#102D53", radius: 4 },
      { box: [1231, 155, 155, 26], text: ["2023 留抵退税 · 万元"], size: 14, color: "#C8E4FF", align: "center" },
      { box: [1231, 185, 155, 40], text: ["2,388"], size: 32, weight: 650, color: "#63DFF3", align: "center" },
    ],
  },
  "data-visualisation/04-real-estate-dashboard": {
    w: 1920, h: 1080, patches: [
      { box: [596, 165, 159, 78], background: "#E3EBFA", radius: 4 },
      { box: [600, 166, 151, 26], text: ["两项示例税金合计 · 亿元"], size: 13, weight: 550, color: "#25354A", align: "center" },
      { box: [600, 194, 151, 40], text: ["76"], size: 35, weight: 650, color: "#B5262D", align: "center" },
      { box: [317, 659, 207, 219], background: "#E5EDFB", donut: {
        legend: false,
        center: ["税金合计（万元）", amountLabel.format(estateTotal)],
        items: estateTaxes.map(item => ({ ...item, value: item.amount / estateTotal * 100 })),
      } },
      { box: [342, 789, 160, 28], background: "#F5F9FF", radius: 4,
        text: ["消费税及附加 " + consumptionShare + "%"], size: 11, weight: 500, color: "#293C55", align: "center" },
    ],
  },
};
