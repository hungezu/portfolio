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
    { id: "P001", title: "基于深度学习的图像识别研究", keywords: ["深度学习", "图像识别", "卷积神经网络"], author: "张三", institution: "清华大学" },
    { id: "P002", title: "人工智能在医疗诊断中的应用", keywords: ["人工智能", "医疗诊断", "深度学习"], author: "李四", institution: "北京大学" },
    { id: "P003", title: "机器学习在金融领域的风险管理", keywords: ["机器学习", "数据分析", "风险管理"], author: "王五", institution: "复旦大学" },
    { id: "P004", title: "自然语言处理在客户服务中的作用", keywords: ["自然语言处理", "文本分析", "智能客服"], author: "赵六", institution: "清华大学" },
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
