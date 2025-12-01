import { useEffect, useRef, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import { Alert, Box, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
  useUpdateSnippetById
} from "../utils/queries.tsx";
import { useFormatSnippet, useGetFileTypes, useGetSnippetById, useRunSnippet, useShareSnippet } from "../utils/queries.tsx";
import { Bòx } from "../components/snippet-table/SnippetBox.tsx";
import { BugReport, Delete, Download, PlayArrow, Save, Share, UploadFile } from "@mui/icons-material";
import { ShareSnippetModal } from "../components/snippet-detail/ShareSnippetModal.tsx";
import { TestSnippetModal } from "../components/snippet-test/TestSnippetModal.tsx";
import { Snippet } from "../utils/snippet.ts";
import { SnippetExecution } from "./SnippetExecution.tsx";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import { queryClient } from "../App.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import { useSnackbarContext } from "../contexts/snackbarContext.tsx";
import { ApiError } from "../api/ApiError.ts";
import { getFileLanguage } from "../utils/snippet.ts";

type SnippetDetailProps = {
  id: string;
  handleCloseModal: () => void;
}

const DownloadButton = ({ snippet }: { snippet?: Snippet }) => {
  if (!snippet) return null;
  const file = new Blob([snippet.content], { type: 'text/plain' });

  return (
    <Tooltip title={"Download"}>
      <IconButton sx={{
        cursor: "pointer"
      }}>
        <a download={`${snippet.name}.${snippet.extension}`} target="_blank"
          rel="noreferrer" href={URL.createObjectURL(file)} style={{
            textDecoration: "none",
            color: "inherit",
            display: 'flex',
            alignItems: 'center',
          }}>
          <Download />
        </a>
      </IconButton>
    </Tooltip>
  )
}

export const SnippetDetail = (props: SnippetDetailProps) => {
  const { id, handleCloseModal } = props;
  const [code, setCode] = useState<string>("");
  const [shareModalOppened, setShareModalOppened] = useState(false)
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false)
  const [testModalOpened, setTestModalOpened] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string[]>([]);

  const { data: snippet, isLoading } = useGetSnippetById(id);
  const { mutate: shareSnippet, isLoading: loadingShare } = useShareSnippet()
  const { mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData } = useFormatSnippet()
  const { createSnackbar } = useSnackbarContext();
  const { data: fileTypes } = useGetFileTypes();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateSnippet, isLoading: isUpdateSnippetLoading } = useUpdateSnippetById({
    onSuccess: () => queryClient.invalidateQueries(['snippet', id]),
    onError: (error: Error) => {
      if (error instanceof ApiError) {
        const errorMessage = error.getErrorMessage();
        createSnackbar('error', errorMessage);
      } else {
        createSnackbar('error', error.message || 'Error al actualizar el snippet');
      }
    }
  })

  const { mutate: runSnippet, isLoading: isRunLoading } = useRunSnippet();

  useEffect(() => {
    if (snippet?.content !== undefined) {
      setCode(snippet.content || "");
    }
  }, [snippet]);

  useEffect(() => {
    if (formatSnippetData !== undefined && formatSnippetData !== null) {
      // Manejar tanto string directo como objeto con propiedad content
      let formattedCode: string;
      if (typeof formatSnippetData === 'string') {
        formattedCode = formatSnippetData;
      } else if (typeof formatSnippetData === 'object' && formatSnippetData !== null && 'content' in formatSnippetData) {
        const contentObj = formatSnippetData as { content?: unknown };
        formattedCode = String(contentObj.content || "");
      } else {
        formattedCode = String(formatSnippetData);
      }
      setCode(formattedCode);
    }
  }, [formatSnippetData])


  async function handleShareSnippet(userId: string) {
    shareSnippet({ snippetId: id, userId })
  }

  function handleRunSnippet() {
    runSnippet(id, {
      onSuccess: (result) => {
        setExecutionOutput(result.output ?? []);
      },
      onError: (error) => {
        createSnackbar('error', error.message || 'Error running snippet');
      }
    });
  }


  const handleLoadFile = async (target: EventTarget & HTMLInputElement) => {
    const files = target.files
    if (!files || !files.length) {
      createSnackbar('error', "Please select at least one file")
      return
    }
    const file = files[0]
    const splitName = file.name.split(".")
    const fileType = getFileLanguage(fileTypes ?? [], splitName.at(-1))
    if (!fileType) {
      createSnackbar('error', `File type ${splitName.at(-1)} not supported`)
      return
    }
    file.text().then((text) => {
      setCode(text)
      createSnackbar('success', 'File loaded successfully')
    }).catch(e => {
      console.error(e)
      createSnackbar('error', 'Error reading file')
    }).finally(() => {
      target.value = ""
    })
  }

  return (
    <Box p={4} minWidth={'60vw'}>
      <Box width={'100%'} p={2} display={'flex'} justifyContent={'flex-end'}>
        <CloseIcon style={{ cursor: "pointer" }} onClick={handleCloseModal} />
      </Box>
      {
        isLoading ? (<>
          <Typography fontWeight={"bold"} mb={2} variant="h4">Loading...</Typography>
          <CircularProgress />
        </>) : <>
          <Typography variant="h4" fontWeight={"bold"}>{snippet?.name ?? "Snippet"}</Typography>
          <Box display="flex" flexDirection="row" gap="8px" padding="8px">
            <Tooltip title={"Share"}>
              <IconButton onClick={() => setShareModalOppened(true)}>
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Test"}>
              <IconButton onClick={() => setTestModalOpened(true)}>
                <BugReport />
              </IconButton>
            </Tooltip>
            <DownloadButton snippet={snippet} />
            <Tooltip title={"Load from file"}>
              <IconButton onClick={() => fileInputRef.current?.click()}>
                <UploadFile />
              </IconButton>
            </Tooltip>
            <Tooltip title={isRunLoading ? "Running..." : "Run"}>
              <IconButton onClick={handleRunSnippet} disabled={isRunLoading}>
                {isRunLoading ? <CircularProgress size={24} /> : <PlayArrow data-testid="PlayArrowIcon" />}
              </IconButton>
            </Tooltip>
            {/* TODO: we can implement a live mode*/}
            <Tooltip title={"Format"}>
              <IconButton onClick={() => formatSnippet(id)} disabled={isFormatLoading}>
                <ReadMoreIcon data-testid="ReadMoreIcon" />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Save changes"}>
              <IconButton color={"primary"} onClick={() => updateSnippet({ id: id, updateSnippet: { content: code } })} disabled={isUpdateSnippetLoading || snippet?.content === code} >
                <Save data-testid="SaveIcon" />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Delete"}>
              <IconButton onClick={() => setDeleteConfirmationModalOpen(true)} >
                <Delete color={"error"} data-testid="DeleteIcon" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box display={"flex"} gap={2}>
            <Bòx flex={1} height={"fit-content"} overflow={"none"} minHeight={"500px"} bgcolor={'black'} color={'white'} code={code}>
              <Editor
                value={typeof code === 'string' ? code : String(code ?? "")}
                padding={10}
                data-testid="snippet-detail-code-editor"
                onValueChange={(code) => setCode(typeof code === 'string' ? code : String(code ?? ""))}
                highlight={(code) => {
                  const codeStr = typeof code === 'string' ? code : String(code || "");
                  return highlight(codeStr, languages.js, "javascript");
                }}
                maxLength={1000}
                style={{
                  minHeight: "500px",
                  fontFamily: "monospace",
                  fontSize: 17,
                }}
              />
            </Bòx>
          </Box>
          <Box pt={1} flex={1} marginTop={2}>
            <Alert severity="info">Output</Alert>
            <SnippetExecution output={executionOutput} />
          </Box>
        </>
      }
      <ShareSnippetModal loading={loadingShare || isLoading} open={shareModalOppened}
        onClose={() => setShareModalOppened(false)}
        onShare={handleShareSnippet} />
      <TestSnippetModal open={testModalOpened} onClose={() => setTestModalOpened(false)} snippetId={id} />
      <DeleteConfirmationModal open={deleteConfirmationModalOpen} onClose={() => setDeleteConfirmationModalOpen(false)} id={snippet?.id ?? ""} setCloseDetails={handleCloseModal} />
      <input
        hidden
        type={"file"}
        ref={fileInputRef}
        multiple={false}
        data-testid={"load-file-input"}
        onChange={e => handleLoadFile(e?.target)}
      />
    </Box>
  );
}

