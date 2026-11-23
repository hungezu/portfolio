export type QueryLayout = "original" | "unified";
export type RecordKind = "paper" | "patent";

export type ResearchRecord = {
  id: string;
  title: string;
  keywords: string[];
  author: string;
  institution: string;
};

export type RecordQuery = {
  layout: QueryLayout;
  text: string;
  recordId: string;
  institution: string;
};

export const researchRecords: Record<RecordKind, ResearchRecord[]> = {
  paper: [
    { id: "P001", title: "基于深度学习的图像识别研究", keywords: ["深度学习", "图像识别", "卷积神经网络"], author: "沈知", institution: "清华大学" },
    { id: "P002", title: "人工智能在医疗诊断中的应用", keywords: ["人工智能", "医疗诊断", "深度学习"], author: "陆川", institution: "北京大学" },
    { id: "P003", title: "机器学习在金融领域的风险管理", keywords: ["机器学习", "数据分析", "风险管理"], author: "陈怡", institution: "复旦大学" },
    { id: "P004", title: "自然语言处理在客户服务中的作用", keywords: ["自然语言处理", "文本分析", "智能客服"], author: "林远", institution: "清华大学" },
    { id: "P005", title: "深度学习在遥感图像中的应用", keywords: ["深度学习", "遥感图像", "目标检测"], author: "陈晨", institution: "北京大学" },
    { id: "P006", title: "科研知识图谱的构建与检索", keywords: ["知识图谱", "语义检索", "数据分析"], author: "周宁", institution: "复旦大学" },
  ],
  patent: [
    { id: "Z001", title: "一种基于深度学习的图像检测方法", keywords: ["深度学习", "图像识别", "目标检测"], author: "林远", institution: "清华大学" },
    { id: "Z002", title: "面向医疗影像的辅助诊断系统", keywords: ["人工智能", "医疗诊断", "深度学习"], author: "陈怡", institution: "北京大学" },
    { id: "Z003", title: "金融风险数据的自动分析方法", keywords: ["机器学习", "数据分析", "风险管理"], author: "郑明", institution: "复旦大学" },
    { id: "Z004", title: "一种多语言文本检索方法", keywords: ["自然语言处理", "文本分析", "语义检索"], author: "方舟", institution: "清华大学" },
    { id: "Z005", title: "遥感影像的目标识别装置", keywords: ["深度学习", "遥感图像", "目标检测"], author: "许清", institution: "北京大学" },
    { id: "Z006", title: "科研知识图谱的数据关联方法", keywords: ["知识图谱", "数据分析", "知识关联"], author: "杨帆", institution: "复旦大学" },
  ],
};

// These are translations of fictional examples, not additional project records.
const sampleTranslations: Record<string, string> = {
  "基于深度学习的图像识别研究": "Image recognition with deep learning",
  "人工智能在医疗诊断中的应用": "Artificial intelligence in medical diagnosis",
  "机器学习在金融领域的风险管理": "Machine learning for financial risk management",
  "自然语言处理在客户服务中的作用": "Natural language processing in customer service",
  "深度学习在遥感图像中的应用": "Deep learning for remote sensing imagery",
  "科研知识图谱的构建与检索": "Building and searching research knowledge graphs",
  "一种基于深度学习的图像检测方法": "An image detection method using deep learning",
  "面向医疗影像的辅助诊断系统": "An assisted diagnosis system for medical images",
  "金融风险数据的自动分析方法": "Automated analysis of financial risk data",
  "一种多语言文本检索方法": "A multilingual text retrieval method",
  "遥感影像的目标识别装置": "An object recognition device for remote sensing images",
  "科研知识图谱的数据关联方法": "Linking data in research knowledge graphs",
  "深度学习": "deep learning", "图像识别": "image recognition", "卷积神经网络": "convolutional neural networks",
  "人工智能": "artificial intelligence", "医疗诊断": "medical diagnosis", "机器学习": "machine learning",
  "数据分析": "data analysis", "风险管理": "risk management", "自然语言处理": "natural language processing",
  "文本分析": "text analysis", "智能客服": "customer support", "遥感图像": "remote sensing",
  "目标检测": "object detection", "知识图谱": "knowledge graphs", "语义检索": "semantic retrieval", "知识关联": "knowledge linking",
  "清华大学": "Tsinghua University", "北京大学": "Peking University", "复旦大学": "Fudan University",
  "沈知": "Shen Zhi", "陆川": "Lu Chuan", "陈怡": "Chen Yi", "林远": "Lin Yuan", "陈晨": "Chen Chen",
  "周宁": "Zhou Ning", "郑明": "Zheng Ming", "方舟": "Fang Zhou", "许清": "Xu Qing", "杨帆": "Yang Fan",
};
const translateSample = (value: string) => sampleTranslations[value] ?? value;
const translateRecords = (records: ResearchRecord[]): ResearchRecord[] => records.map(record => ({
  ...record, title: translateSample(record.title), author: translateSample(record.author),
  institution: translateSample(record.institution), keywords: record.keywords.map(translateSample),
}));
export const researchRecordsEnglish: Record<RecordKind, ResearchRecord[]> = {
  paper: translateRecords(researchRecords.paper), patent: translateRecords(researchRecords.patent),
};

export const emptyRecordQuery = (layout: QueryLayout): RecordQuery => ({
  layout,
  text: "",
  recordId: "",
  institution: "",
});

const normalize = (value: string) => value.trim().toLocaleLowerCase();

/** Both record types use the same filtering contract; only the data changes. */
export function queryResearchRecords(records: ResearchRecord[], query: RecordQuery): ResearchRecord[] {
  const text = normalize(query.text);
  const recordId = normalize(query.recordId);

  return records.filter((record) => {
    if (query.layout === "original") {
      return (!recordId || normalize(record.id) === recordId)
        && (!text || normalize(record.title).includes(text));
    }

    const searchableText = normalize(`${record.title} ${record.keywords.join(" ")}`);
    return (!text || searchableText.includes(text))
      && (!query.institution || record.institution === query.institution);
  });
}
