import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./index";
import { Button } from "../button";
import { Input } from "../input";

const meta = {
  title: "Components/Form",
  component: Form,
  tags: ["autodocs"],
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

function FormDemo() {
  const form = useForm({
    defaultValues: { username: "" },
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => console.log(data))}
        className="space-y-4 w-[350px]"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

/** Story usa render customizado; args não mapeiam props do Form (useForm). */
export const Default: Story = {
  args: {} as unknown as Story["args"],
  render: () => <FormDemo />,
};
