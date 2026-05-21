import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./index";

/** Props do InputOTP controláveis via args (children vêm do render). */
type InputOTPArgs = Omit<
  ComponentProps<typeof InputOTP>,
  "children"
>;

const meta = {
  title: "Components/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: ({
    maxLength: 6,
  } satisfies InputOTPArgs) as unknown as Story["args"],
  render: (args) => (
    <InputOTP maxLength={args.maxLength}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSeparator />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};
