import {httpClient, httpUserClient} from "../api/httpClient";
import { SnippetOperations } from "../utils/snippetOperations.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "../utils/snippet.ts";
import {PaginatedUsers} from "../utils/users.ts";
import {Rule} from "../types/Rule.ts";
import {TestCase} from "../types/TestCase.ts";
import {TestCaseResult} from "../utils/queries.tsx";
import {FileType} from "../types/FileType.ts";

// Adapter

// fixme
// fixme: endpoints
export class SnippetOperationsAdapter implements SnippetOperations {

    async listSnippetDescriptors(page: number, pageSize: number, name?: string) {
        return httpClient.get<PaginatedSnippets>(`/snippets/descriptors?page=${page}&pageSize=${pageSize}&name=${name ?? ""}`);
    }

    async createSnippet(data: CreateSnippet) {
        return httpClient.post<Snippet>(`/snippets/create`, data);
    }

    async getSnippetById(id: string) {
        return httpClient.get<Snippet | undefined>(`/snippets/${id}`);
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet) {
        return httpClient.put<Snippet>(`/snippets/${id}`, updateSnippet);
    }

    async deleteSnippet(id: string) {
        return httpClient.delete<string>(`/snippets/${id}`);
    }

    // todo: ==== USERS ====
    async getUserFriends(name?: string, page?: number, pageSize?: number) {
        return httpUserClient.get<PaginatedUsers>(`/v1/user/friends?name=${name ?? ""}&page=${page ?? 0}&pageSize=${pageSize ?? 10}`);
    }

    async shareSnippet(snippetId: string, userId: string) {
        return httpUserClient.post<Snippet>(`/v1/snippet/${snippetId}/share/${userId}`);
    }

    async getFormatRules() {
        return httpClient.get<Rule[]>(`/snippets/rules/format`);
    }

    async getLintingRules() {
        return httpClient.get<Rule[]>(`/snippets/rules/lint`);
    }

    async modifyFormatRule(newRules: Rule[]) {
        return httpClient.put<Rule[]>(`/snippets/rules/format`, newRules);
    }

    async modifyLintingRule(newRules: Rule[]) {
        return httpClient.put<Rule[]>(`/snippets/rules/lint`, newRules);
    }

    async getTestCases(snippetId: string) {
        return httpClient.get<TestCase[]>(`/tests/${snippetId}`);
    }


    async postTestCase(snippetId: string, testCase: Partial<TestCase>) {
        return httpClient.post<TestCase>(`/tests/${snippetId}`, testCase);
    }

    async removeTestCase(id: string) {
        return httpClient.delete<string>(`/tests/${id}`);
    }


    // todo
    async testSnippet(snippetId: string, testCase: Partial<TestCase>) {
        return httpClient.post<TestCaseResult>(`/tests/run/${snippetId}`, testCase)
    }

    // todo: id (necesitamos el id, para saber cual es el snippet a formatear) - chequea que recibe en snippet
    // tambien chequeate la logica de lo que recibe en el SnippetModal.
    async formatSnippet(snippet: string) {
        return httpClient.post<string>(`/snippets/${snippet}/format`); // /snippets/${id}/format
    }

    async getFileTypes() {
        return httpClient.get<FileType[]>(`/snippets/filetypes`);
    }
}
