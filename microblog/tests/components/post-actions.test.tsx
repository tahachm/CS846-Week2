import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostActions from "@/components/post-actions";

// Stub fetch for likes and replies flows so tests are deterministic and log behavior
const fetchMock = vi.fn();

// @ts-ignore
global.fetch = fetchMock;

const baseProps = {
    postId: 1,
    initialLikeCount: 0,
    initialReplyCount: 0,
    initiallyLiked: false,
    authenticated: true,
};

describe("PostActions component", () => {
    it("allows liking and unliking a post", async () => {
        console.info("[post-actions.test] like/unlike flow starting");

        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        render(<PostActions {...baseProps} />);

        const likeButton = screen.getByRole("button", { name: /like/i });
        expect(likeButton).toBeTruthy();

        await userEvent.click(likeButton);
        console.info("[post-actions.test] clicked like");

        await waitFor(() => {
            expect(likeButton.textContent || "").toMatch(/liked/i);
        });

        await userEvent.click(likeButton);
        console.info("[post-actions.test] clicked unlike");

        await waitFor(() => {
            expect(likeButton.textContent || "").toMatch(/like/i);
        });
    });

    it("submits a reply and appends it to the list", async () => {
        console.info("[post-actions.test] reply flow starting");

        fetchMock.mockImplementation((url: string, options?: RequestInit) => {
            if (url.includes("/replies") && options?.method === "POST") {
                const body = options.body as string;
                const parsed = JSON.parse(body);
                console.info("[post-actions.test] reply payload", parsed);
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        id: 1,
                        content: parsed.content,
                        createdAt: new Date().toISOString(),
                        author: { username: "alice", displayName: "Alice" },
                    }),
                });
            }
            if (url.includes("/replies")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ replies: [] }),
                });
            }
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });

        render(<PostActions {...baseProps} />);

        // There can be multiple PostActions rendered in some contexts;
        // use the first matching textarea for this unit test.
        const [textarea] = screen.getAllByPlaceholderText(/write a reply/i);
        await userEvent.type(textarea, "Nice post!");

        const [submit] = screen.getAllByRole("button", { name: /reply$/i });
        await userEvent.click(submit);

        await waitFor(() => {
            const reply = screen.getByText("Nice post!");
            expect(reply).toBeTruthy();
        });
    });
});
