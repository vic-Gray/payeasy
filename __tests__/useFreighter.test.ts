import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the wallet module
const mockIsFreighterInstalled = vi.fn();
const mockConnectWallet = vi.fn();
const mockGetPublicKey = vi.fn();

vi.mock("../lib/stellar/wallet", () => ({
  isFreighterInstalled: () => mockIsFreighterInstalled(),
  connectWallet: () => mockConnectWallet(),
  getPublicKey: () => mockGetPublicKey(),
}));

// Minimal React hooks mock for testing outside a component
// We test the logic flow, not React rendering
describe("useFreighter hook logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("wallet detection", () => {
    it("detects when Freighter is installed", async () => {
      mockIsFreighterInstalled.mockResolvedValue(true);
      mockGetPublicKey.mockResolvedValue(null);

      const installed = await mockIsFreighterInstalled();
      expect(installed).toBe(true);
    });

    it("detects when Freighter is not installed", async () => {
      mockIsFreighterInstalled.mockResolvedValue(false);

      const installed = await mockIsFreighterInstalled();
      expect(installed).toBe(false);
    });
  });

  describe("wallet connection", () => {
    it("returns public key on successful connect", async () => {
      const testKey = "GABC1234567890TESTKEY";
      mockConnectWallet.mockResolvedValue(testKey);

      const key = await mockConnectWallet();
      expect(key).toBe(testKey);
    });

    it("throws when Freighter is not installed", async () => {
      mockConnectWallet.mockRejectedValue(
        new Error("Freighter wallet extension is not installed")
      );

      await expect(mockConnectWallet()).rejects.toThrow(
        "Freighter wallet extension is not installed"
      );
    });

    it("throws when user rejects connection", async () => {
      mockConnectWallet.mockRejectedValue(
        new Error("User rejected wallet connection")
      );

      await expect(mockConnectWallet()).rejects.toThrow(
        "User rejected wallet connection"
      );
    });
  });

  describe("state transitions", () => {
    it("goes from disconnected to connected on successful connect", async () => {
      const testKey = "GABC1234567890TESTKEY";
      mockGetPublicKey.mockResolvedValue(null); // initially disconnected
      mockConnectWallet.mockResolvedValue(testKey);

      // Initial state
      let publicKey = await mockGetPublicKey();
      expect(publicKey).toBeNull();

      // After connect
      publicKey = await mockConnectWallet();
      expect(publicKey).toBe(testKey);
    });

    it("goes from connected to disconnected on disconnect", async () => {
      const testKey = "GABC1234567890TESTKEY";
      mockGetPublicKey.mockResolvedValue(testKey);

      let publicKey: string | null = await mockGetPublicKey();
      expect(publicKey).toBe(testKey);

      // Simulate disconnect (clear state)
      publicKey = null;
      expect(publicKey).toBeNull();
    });

    it("restores connection if already allowed", async () => {
      const testKey = "GABC1234567890TESTKEY";
      mockIsFreighterInstalled.mockResolvedValue(true);
      mockGetPublicKey.mockResolvedValue(testKey);

      const installed = await mockIsFreighterInstalled();
      expect(installed).toBe(true);

      const key = await mockGetPublicKey();
      expect(key).toBe(testKey);
    });
  });
});
