import { useState } from "react";
import { TestCase } from "../../types/TestCase.ts";
import { Autocomplete, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { BugReport, Delete, Save } from "@mui/icons-material";
import { useTestSnippet } from "../../utils/queries.tsx";
import { TestCaseResult } from "../../utils/queries.tsx";
import { SnippetExecutionTest } from "../../screens/SnippetExecution.tsx";

type TabPanelProps = {
    index: number;
    value: number;
    snippetId: string;
    test?: TestCase;
    setTestCase: (test: Partial<TestCase>) => void;
    removeTestCase?: (testIndex: string) => void;
}

export const TabPanel = ({ value, index, snippetId, test: initialTest, setTestCase, removeTestCase }: TabPanelProps) => {
    const [testData, setTestData] = useState<Partial<TestCase> | undefined>(initialTest);
    const [testResult, setTestResult] = useState<TestCaseResult | null>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [outputValue, setOutputValue] = useState<string>('');

    const { mutateAsync: testSnippet, isLoading } = useTestSnippet(snippetId);

    const handleTest = async () => {
        try {
            const result = await testSnippet(testData ?? {});
            setTestResult(result);
        } catch (error) {
            console.error('Error testing snippet:', error);
            setTestResult({ status: "fail", output: [] });
        }
    };


    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{ width: '100%', height: '100%' }}
        >
            {value === index && (
                <Box sx={{ px: 3 }} display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Name</Typography>
                        <TextField size="small" value={testData?.name}
                            onChange={(e) => setTestData({ ...testData, name: e.target.value })} />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Input</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="tags-filled-input"
                            freeSolo
                            value={testData?.input ?? []}
                            inputValue={inputValue}
                            onInputChange={(_, newInputValue) => {
                                setInputValue(newInputValue);
                            }}
                            onChange={(_, newValue) => {
                                setTestData({ ...testData, input: newValue });
                            }}
                            selectOnFocus
                            handleHomeEndKeys
                            blurOnSelect={false}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            const trimmedValue = inputValue.trim();
                                            if (trimmedValue) {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                const currentInputs = testData?.input ?? [];
                                                const newInputs = [...currentInputs, trimmedValue];
                                                setTestData({ ...testData, input: newInputs });
                                                setInputValue('');
                                            }
                                        }
                                    }}
                                />
                            )}
                            options={[]}
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Output</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="tags-filled-output"
                            freeSolo
                            value={testData?.output ?? []}
                            inputValue={outputValue}
                            onInputChange={(_, newInputValue) => {
                                setOutputValue(newInputValue);
                            }}
                            onChange={(_, newValue) => {
                                setTestData({ ...testData, output: newValue });
                            }}
                            selectOnFocus
                            handleHomeEndKeys
                            blurOnSelect={false}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            const trimmedValue = outputValue.trim();
                                            if (trimmedValue) {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                const currentOutputs = testData?.output ?? [];
                                                const newOutputs = [...currentOutputs, trimmedValue];
                                                setTestData({ ...testData, output: newOutputs });
                                                setOutputValue('');
                                            }
                                        }
                                    }}
                                />
                            )}
                            options={[]}
                        />
                    </Box>
                    <Box display="flex" flexDirection="row" gap={1}>
                        {
                            (testData?.id && removeTestCase) && (
                                <Button onClick={() => removeTestCase(testData?.id ?? "")} variant={"outlined"} color={"error"}
                                    startIcon={<Delete />}>
                                    Remove
                                </Button>)
                        }
                        <Button disabled={!testData?.name} onClick={() => setTestCase(testData ?? {})} variant={"outlined"} startIcon={<Save />}>
                            Save
                        </Button>
                        <Button
                            onClick={handleTest}
                            variant={"contained"}
                            startIcon={<BugReport />}
                            disabled={isLoading}
                            disableElevation>
                            Test
                        </Button>
                        {testResult && (
                            (typeof testResult === 'string' ? testResult : testResult.status) === "success" ?
                                <Chip label="Pass" color="success" /> :
                                <Chip label="Fail" color="error" />
                        )}
                    </Box>
                    {testResult && typeof testResult !== 'string' && testResult.output && (
                        <Box display="flex" flexDirection="column" gap={1} flex={1}>
                            <Typography fontWeight="bold">Output</Typography>
                            <SnippetExecutionTest output={testResult.output} />
                        </Box>
                    )}
                </Box>
            )}
        </div>
    );
}