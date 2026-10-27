"use client";
import { useI18n } from "../i18n";


import { useId } from "react";
import { Radio } from "@arco-design/web-react";
import "./gkx-segmented-control.css";

export function GkxSegmentedControl<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  const { t, localize } = useI18n();
  const name = useId();
  return <div className="gkx-segmented-control" role="group" aria-label={t(label)}>
    <Radio.Group name={name} type="button" size="large" value={value} options={localize(options)} onChange={onChange} />
  </div>;
}
