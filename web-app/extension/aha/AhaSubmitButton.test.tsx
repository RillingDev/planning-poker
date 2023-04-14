import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedObject, vi } from "vitest";
import {
  clearVotes,
  editExtensionRoomConfig,
  getExtensionRoomConfig,
} from "../../api";
import { createMockRoom, createMockVoteSummary } from "../../test/dataFactory";
import { ahaExtension } from "./AhaExtension";
import { AhaSubmitButton } from "./AhaSubmitButton";
import type { AhaClient } from "./api";
import { AhaRoomConfig } from "./model";
import { getProductScoreFactNames } from "./utils";

vi.mock("./AhaExtension");

vi.mock("../../api");

vi.mock("./utils");

describe("AhaSubmissionModal", () => {
  let ahaClient: MockedObject<AhaClient>;
  beforeEach(async () => {
    ahaClient = vi.mocked(await ahaExtension.getClient());
  });

  it("shows button", () => {
    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    expect(screen.getByText("Save to Aha!")).toBeInTheDocument();

    // Hidden by default
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  it("hides button if topic is not in the right syntax", () => {
    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "X" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    expect(screen.getByText("Save to Aha!")).not.toBeVisible();
  });

  it("shows modal", async () => {
    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("shows error when idea loading fails", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue(
      null
    );

    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    expect(ahaClient.getIdea).toHaveBeenCalledWith("ABC-I-123", [
      "name",
      "reference_num",
    ]);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not find idea 'ABC-I-123'."
    );
    expect(screen.getByText("Submit")).toBeDisabled();
  });

  it("loads idea", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });
    vi.mocked(getProductScoreFactNames).mockResolvedValue([]);
    vi.mocked(getExtensionRoomConfig<AhaRoomConfig>).mockResolvedValue({
      scoreFactName: null,
    });

    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    expect(ahaClient.getIdea).toHaveBeenCalledWith("ABC-I-123", [
      "name",
      "reference_num",
    ]);
    expect(screen.getByText("ABC-I-123: Foo")).toBeInTheDocument();
    // Rounded score
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeEnabled();
  });

  it("loads score fact names", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });
    vi.mocked(getProductScoreFactNames).mockResolvedValue(["Lorem", "Ipsum"]);
    vi.mocked(getExtensionRoomConfig<AhaRoomConfig>).mockResolvedValue({
      scoreFactName: null,
    });

    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    expect(getProductScoreFactNames).toHaveBeenCalledWith("456");
    const scoreFactNames =
      screen.getByLabelText<HTMLSelectElement>("Score Fact Name");
    // Placeholder + 2 values
    expect(scoreFactNames.options.length).toBe(3);
    expect(scoreFactNames.options.item(1)?.value).toBe("Lorem");
    expect(scoreFactNames.options.item(2)?.value).toBe("Ipsum");
    expect(scoreFactNames.value).toBe("");
  });

  it("loads previously selected score fact name", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });
    vi.mocked(getProductScoreFactNames).mockResolvedValue(["Lorem", "Ipsum"]);
    vi.mocked(getExtensionRoomConfig<AhaRoomConfig>).mockResolvedValue({
      scoreFactName: "Ipsum",
    });

    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123", name: "Room" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    expect(getProductScoreFactNames).toHaveBeenCalledWith("456");
    expect(getExtensionRoomConfig).toHaveBeenCalledWith(
      "Room",
      ahaExtension.key
    );
    expect(
      screen.getByLabelText<HTMLSelectElement>("Score Fact Name").value
    ).toBe("Ipsum");
  });

  it("ignores previously selected score fact name if its not present in the loaded options", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });
    vi.mocked(getProductScoreFactNames).mockResolvedValue(["Lorem", "Ipsum"]);
    vi.mocked(getExtensionRoomConfig<AhaRoomConfig>).mockResolvedValue({
      scoreFactName: "Fizz",
    });

    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    expect(getProductScoreFactNames).toHaveBeenCalledWith("456");
    expect(getExtensionRoomConfig).toHaveBeenCalledWith(
      "Room",
      ahaExtension.key
    );
    expect(
      screen.getByLabelText<HTMLSelectElement>("Score Fact Name").value
    ).toBe("");
  });

  it("submits", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });
    vi.mocked(getProductScoreFactNames).mockResolvedValue(["Lorem", "Ipsum"]);
    vi.mocked(getExtensionRoomConfig<AhaRoomConfig>).mockResolvedValue({
      scoreFactName: null,
    });
    vi.mocked(ahaClient.putIdeaScore).mockImplementation(() =>
      Promise.resolve()
    );
    vi.mocked(editExtensionRoomConfig).mockImplementation(() =>
      Promise.resolve()
    );
    vi.mocked(clearVotes).mockImplementation(() => Promise.resolve());

    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123", name: "My Room" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    await userEvent.selectOptions(
      screen.getByLabelText("Score Fact Name"),
      "Lorem"
    );

    await userEvent.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(
        screen.queryByText("Submitting Idea Score")
      ).not.toBeInTheDocument()
    );

    expect(ahaClient.putIdeaScore).toHaveBeenCalledWith(
      "ABC-I-123",
      "Lorem",
      11
    );
    expect(editExtensionRoomConfig).toHaveBeenCalledWith("My Room", "aha", {
      scoreFactName: "Lorem",
    });
    expect(clearVotes).toHaveBeenCalledWith("My Room");
  });

  it("shows error if submission fails", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });
    vi.mocked(getProductScoreFactNames).mockResolvedValue(["Lorem", "Ipsum"]);
    vi.mocked(getExtensionRoomConfig<AhaRoomConfig>).mockResolvedValue({
      scoreFactName: null,
    });
    vi.mocked(ahaClient.putIdeaScore).mockRejectedValue(new Error("Beeb Boop"));
    vi.mocked(editExtensionRoomConfig).mockImplementation(() =>
      Promise.resolve()
    );

    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123", name: "My Room" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    await userEvent.selectOptions(
      screen.getByLabelText("Score Fact Name"),
      "Lorem"
    );

    await userEvent.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(screen.getByText("Submitting Idea Score")).not.toBeVisible()
    );

    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByText("Submit")).toBeDisabled();
    expect(clearVotes).not.toHaveBeenCalled();
  });

  it("clears values after submit", async () => {
    vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
      idea: {
        id: "123",
        product_id: "456",
        reference_num: "ABC-I-123",
        name: "Foo",
      },
    });
    vi.mocked(getProductScoreFactNames).mockResolvedValue(["Lorem", "Ipsum"]);
    vi.mocked(getExtensionRoomConfig<AhaRoomConfig>).mockResolvedValue({
      scoreFactName: null,
    });
    vi.mocked(ahaClient.putIdeaScore).mockImplementation(() =>
      Promise.resolve()
    );
    vi.mocked(editExtensionRoomConfig).mockImplementation(() =>
      Promise.resolve()
    );
    vi.mocked(clearVotes).mockImplementation(() => Promise.resolve());

    render(
      <AhaSubmitButton
        room={createMockRoom({ topic: "ABC-I-123", name: "My Room" })}
        voteSummary={createMockVoteSummary({ average: 10.9 })}
      />
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    await userEvent.selectOptions(
      screen.getByLabelText("Score Fact Name"),
      "Lorem"
    );

    await userEvent.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(
        screen.queryByText("Submitting Idea Score")
      ).not.toBeInTheDocument()
    );

    await userEvent.click(screen.getByText("Save to Aha!"));

    await waitFor(() =>
      expect(screen.getByText("Loading Idea")).not.toBeVisible()
    );

    expect(ahaClient.getIdea).toHaveBeenCalledTimes(2);
    expect(getProductScoreFactNames).toHaveBeenCalledTimes(2);
  });
});
