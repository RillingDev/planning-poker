import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, MockedObject, vi } from "vitest";
import { createMockRoom } from "../../test/dataFactory.ts";
import { ahaExtension } from "./AhaExtension.ts";
import { AhaRoomButton } from "./AhaRoomButton.tsx";
import type { AhaClient } from "./api";

vi.mock("./AhaExtension");

describe("AhaRoomButton", () => {
  let ahaClient: MockedObject<AhaClient>;
  beforeEach(async () => {
    ahaClient = vi.mocked(await ahaExtension.getClient());
  });

  it("shows button", () => {
    render(<AhaRoomButton room={createMockRoom({})} onChange={vi.fn()} />);

    expect(screen.getByText("Load from Aha!")).toBeInTheDocument();

    // Hidden by default
    expect(screen.queryByText("Import Idea")).not.toBeInTheDocument();
  });

  it("shows modal", async () => {
    render(<AhaRoomButton room={createMockRoom({})} onChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Load from Aha!"));

    expect(screen.getByText("Import Idea")).toBeInTheDocument();
  });

  it("validates that the syntax of the input is correct", async () => {
    render(<AhaRoomButton room={createMockRoom({})} onChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Load from Aha!"));

    const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
    await userEvent.type(input, "X");

    expect(input).not.toBeValid();
    expect(input.validity.customError).toBe(true);
    expect(ahaClient.getIdea).not.toBeCalled();
  });

  it("validates that a matching idea exists", async () => {
    ahaClient.getIdea.mockResolvedValue(null);

    render(<AhaRoomButton room={createMockRoom({})} onChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Load from Aha!"));

    const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
    await userEvent.type(input, "ABC-I-123");

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible(),
    );

    expect(ahaClient.getIdea).toHaveBeenCalledWith("ABC-I-123", [
      "name",
      "reference_num",
    ]);
    expect(screen.getByText("Preview")).not.toBeVisible();
    expect(input).not.toBeValid();
    expect(input.validity.customError).toBe(true);
  });

  it("shows matching idea", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockImplementation(
      (ideaId) => {
        if (ideaId === "ABC-I-123") {
          return Promise.resolve({
            idea: {
              id: "123",
              product_id: "456",
              reference_num: "ABC-I-123",
              name: "Foo",
            },
          });
        }
        return Promise.resolve(null);
      },
    );

    render(<AhaRoomButton room={createMockRoom({})} onChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Load from Aha!"));

    const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
    await userEvent.type(input, "ABC-I-123");

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible(),
    );

    expect(ahaClient.getIdea).toHaveBeenCalledWith("ABC-I-123", [
      "name",
      "reference_num",
    ]);
    expect(screen.getByText("Preview")).toBeVisible();
    expect(screen.getByText("ABC-I-123: Foo")).toBeInTheDocument();
    expect(screen.getByText("Import Idea")).toBeEnabled();
    expect(input).toBeValid();
  });

  it("submits idea", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });

    const onChange = vi.fn();
    render(<AhaRoomButton room={createMockRoom({})} onChange={onChange} />);

    await userEvent.click(screen.getByText("Load from Aha!"));

    const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
    await userEvent.type(input, "ABC-I-123");

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible(),
    );

    await userEvent.click(screen.getByText("Import Idea"));

    expect(onChange).toHaveBeenCalledWith({ topic: "ABC-I-123: Foo" });
    // Hidden after submission.
    expect(screen.queryByText("Import Idea")).not.toBeInTheDocument();
  });

  it("reacts to error", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockRejectedValue(
      new Error("Beep Boop"),
    );

    const onChange = vi.fn();
    render(<AhaRoomButton room={createMockRoom({})} onChange={onChange} />);

    await userEvent.click(screen.getByText("Load from Aha!"));

    const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
    await userEvent.type(input, "A");

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible(),
    );

    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByText("Import Idea")).toBeDisabled();
  });

  it("clears idea after submit", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });

    render(<AhaRoomButton room={createMockRoom({})} onChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Load from Aha!"));

    const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
    await userEvent.type(input, "ABC-I-123");

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible(),
    );

    await userEvent.click(screen.getByText("Import Idea"));

    await userEvent.click(screen.getByText("Load from Aha!"));

    expect(input.value).toBe("");
    expect(screen.getByText("Loading Idea")).not.toBeVisible();
    expect(screen.getByText("Preview")).not.toBeVisible();
  });
});
