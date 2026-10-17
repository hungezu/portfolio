"use client";

import { useId } from "react";
import { Radio } from "@arco-design/web-react";
import "./gkx-segmented-control.css";

export function GkxSegmentedControl<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return <div className="gkx-segmented-control" role="group" aria-label={label}>
    <Radio.Group name={name} type="button" size="large" value={value} options={options} onChange={onChange} />
  </div>;
}
