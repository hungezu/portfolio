import type { Metadata } from "next";
import PortfolioClient from "../../../portfolio-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== "zhaocai-smart") return {};

  const title = "招财 Smart｜AI 财务智能问数项目｜李家豪";
  const description = "招财 Smart AI 财务智能问数项目案例：口径确认、人机控制权、失败恢复、结果追溯与设计交付边界。";
  const image = "/assets/projects/zhaocai-smart/long-image/assets/homepage-original.png";
  return {
    title,
    description,
    openGraph: {
      title: "招财 Smart｜AI 财务智能问数项目",
      description,
      type: "article",
      images: [{ url: image, alt: "招财 Smart 财务智能问数产品界面" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PortfolioClient projectSlug={slug} />;
}
