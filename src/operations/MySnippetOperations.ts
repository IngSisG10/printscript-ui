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
export class MySnippetOperations implements SnippetOperations {


    // todo: esto deberia tener logica en back seguramente
    async listSnippetDescriptors(page: number, pageSize: number, name?: string) {
        return httpClient.get<PaginatedSnippets>(`/snippets?page=${page}&pageSize=${pageSize}&name=${name ?? ""}`);
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

    // ==== USERS ====
    async getUserFriends(name?: string, page?: number, pageSize?: number) {
        return httpUserClient.get<PaginatedUsers>(`/v1/user/friends?name=${name ?? ""}&page=${page ?? 0}&pageSize=${pageSize ?? 10}`);
    }

    async shareSnippet(snippetId: string, userId: string) {
        return httpUserClient.post<Snippet>(`/v1/snippet/${snippetId}/share/${userId}`);
    }

    // todo: ==== RULES ==== (snippet service -> printscript service)
    async getFormatRules() {
        return httpClient.get<Rule[]>(`/rules/format`);
    }

    async getLintingRules() {
        return httpClient.get<Rule[]>(`/rules/lint`);
    }

    async modifyFormatRule(newRules: Rule[]) {
        return httpClient.put<Rule[]>(`/v1/rules/format`, newRules);
    }

    async modifyLintingRule(newRules: Rule[]) {
        return httpClient.put<Rule[]>(`/v1/rules/lint`, newRules);
    }

    // todo: => ==== TEST CASES ====
    async getTestCases() {
        return httpClient.get<TestCase[]>(`/testcase`);
    }

    async postTestCase(testCase: Partial<TestCase>) {
        return httpClient.post<TestCase>(`/v1/testcase`, testCase);
    }

    async removeTestCase(id: string) {
        return httpClient.delete<string>(`/testcase/${id}`);
    }

    async testSnippet(testCase: Partial<TestCase>) {
        return httpClient.post<TestCaseResult>(`/snippets/test`, testCase);
    }

    // todo: id => ==== FORMATTING ====
    async formatSnippet(snippet: string) {
        return httpClient.post<string>(`/snippets/${snippet}/format`, { snippet }); // /snippets/${id}/format
    }

    // todo: ==== FILE TYPES ====
    async getFileTypes() {
        return httpClient.get<FileType[]>(`/v1/filetypes`);
    }
}
