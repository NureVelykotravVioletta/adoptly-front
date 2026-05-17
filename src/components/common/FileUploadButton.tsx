"use client";

import { type RefObject } from "react";
import { Button } from "@/src/components/common/Button";

type FileUploadButtonProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  name: string;
  label?: string;
  multiple?: boolean;
  accept?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FileUploadButton({
  inputRef,
  name,
  label = "Завантажити фото",
  multiple = false,
  accept = "image/*",
  onChange,
}: FileUploadButtonProps) {
  return (
    <>
      <Button
        variant="secondary"
        size="md"
        onClick={() => inputRef.current?.click()}
        className="font-medium"
      >
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={onChange}
      />
    </>
  );
}
