import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import MonsterManager from "../../components/DMToolkit/MonsterManager";
import * as monsterService from "../../services/monsterService";
import { UserContext } from "../../context/UserContext";

vi.mock("../../services/monsterService");

const mockUser = { _id: "user1", token: "mock-token" };

describe("MonsterManager", () => {
  beforeEach(() => {
    monsterService.fetchMonsters.mockResolvedValue([]);
    monsterService.createMonster.mockResolvedValue({
      _id: "123",
      content: { name: "Goblin", campaigns: [] },
    });
    monsterService.updateMonster.mockResolvedValue({
      _id: "123",
      content: { name: "Goblin King", campaigns: [] },
    });
    monsterService.deleteMonster.mockResolvedValue();
  });

  it("renders with no monsters", async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MonsterManager />
      </UserContext.Provider>
    );

    expect(await screen.findByText("No monsters yet.")).toBeInTheDocument();
  });

  it("opens the form with default data on new monster click", async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MonsterManager />
      </UserContext.Provider>
    );

    fireEvent.click(await screen.findByText("+ New Monster"));
    expect(screen.getByText("Monster Details")).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("creates a monster and adds it to the list", async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MonsterManager />
      </UserContext.Provider>
    );

    fireEvent.click(await screen.findByText("+ New Monster"));
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Goblin" },
    });
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(monsterService.createMonster).toHaveBeenCalled();
    });
    expect(await screen.findByText("Goblin")).toBeInTheDocument();
  });

  // Additional tests for editing, deleting, and campaign assignment can follow a similar pattern
});
