import type { Meta, StoryObj } from "@storybook/react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./index";
import { Button } from "../button";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-medium">@guardiafinance/design-system</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">Toggle</Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">
        @guardiafinance/design-system
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          Collapsible content.
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};
