import { type ComponentPropsWithoutRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  label: string;
  name: string;
  errors?: string[];
  className?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "name">;

export function FormField({
  label,
  name,
  errors,
  className,
  ...props
}: FormFieldProps) {
  const hasError = !!errors?.length;

  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${name}-error` : undefined}
        className="mt-1.5"
        {...props}
      />
      {hasError && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-destructive">
          {errors[0]}
        </p>
      )}
    </div>
  );
}
