import PortfolioClient from "../../../portfolio-client";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PortfolioClient projectSlug={slug} />;
}
