import {
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";

import { AddSnippetModal } from "./AddSnippetModal.tsx";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Add, Search } from "@mui/icons-material";
import { LoadingSnippetRow, SnippetRow } from "./SnippetRow.tsx";
import { CreateSnippetWithLang, getFileLanguage, Snippet } from "../../utils/snippet.ts";
import { usePaginationContext } from "../../contexts/paginationContext.tsx";
import { useSnackbarContext } from "../../contexts/snackbarContext.tsx";
import { useGetFileTypes } from "../../utils/queries.tsx";

type SnippetTableProps = {
  handleClickSnippet: (id: string) => void;
  snippets?: Snippet[];
  loading: boolean;
  handleSearchSnippet: (snippetName: string) => void;
  compliance: string;
  setCompliance: Dispatch<SetStateAction<string>>;
  status: string;
  setStatus: Dispatch<SetStateAction<string>>;
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
}

export const SnippetTable = (props: SnippetTableProps) => {
  const { snippets, handleClickSnippet, loading, handleSearchSnippet, compliance, setCompliance, language, setLanguage, status, setStatus } = props;
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [popoverMenuOpened, setPopoverMenuOpened] = useState(false)
  const [snippet, setSnippet] = useState<CreateSnippetWithLang | undefined>()
  const popoverRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { page, page_size: pageSize, count, handleChangePageSize, handleGoToPage } = usePaginationContext()
  const { createSnackbar } = useSnackbarContext()
  const { data: fileTypes } = useGetFileTypes();

  const handleLoadSnippet = async (target: EventTarget & HTMLInputElement) => {
    const files = target.files
    if (!files || !files.length) {
      createSnackbar('error', "Please select at leat one file")
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
      setSnippet({
        name: splitName[0],
        content: text,
        language: fileType.language,
        extension: fileType.extension
      })
    }).catch(e => {
      console.error(e)
    }).finally(() => {
      setAddModalOpened(true)
      target.value = ""
    })
  }

  function handleClickMenu() {
    setPopoverMenuOpened(false)
  }

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box sx={{ background: 'white', width: '30%', display: 'flex', borderRadius: '10px' }}>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search Snippet"
            inputProps={{ 'aria-label': 'search' }}
            onChange={e => handleSearchSnippet(e.target.value)}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <Search />
          </IconButton>
        </Box>
            <Box display="flex" gap={2}>
                <Select
                    value={compliance}
                    onChange={(e) => setCompliance(e.target.value)}
                    sx={{
                        minWidth: 120,
                        boxShadow: 0,
                        background: 'white',
                        color: 'black',
                        borderRadius: '10px',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSelect-icon': { color: 'black' }
                    }}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="valid">Valid</MenuItem>
                    <MenuItem value="invalid">Invalid</MenuItem>
                </Select>
                <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    sx={{
                        minWidth: 120,
                        boxShadow: 0,
                        background: 'white',
                        color: 'black',
                        borderRadius: '10px',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSelect-icon': { color: 'black' }
                    }}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="owner">Owner</MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                </Select>
                <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    displayEmpty
                    sx={{
                        minWidth: 120,
                        boxShadow: 0,
                        background: 'white',
                        color: 'black',
                        borderRadius: '10px',
                        '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                        '& .MuiSelect-icon': { color: 'black' }
                    }}
                >
                    <MenuItem value="">
                        <em>Language</em>
                    </MenuItem>
                    {fileTypes?.map(fileType => (
                        <MenuItem key={fileType.language} value={fileType.language}>{fileType.language}</MenuItem>
                    ))}
                </Select>

                <Button ref={popoverRef} variant="contained" disableRipple sx={{ boxShadow: 0 }}
                        onClick={() => setPopoverMenuOpened(true)}>
                    <Add />
                    Add Snippet
                </Button>
            </Box>
        </Box>
      <Table size="medium" sx={{ borderSpacing: "0 10px", borderCollapse: "separate" }}>
        <TableHead>
          <TableRow sx={{ fontWeight: 'bold' }}>
            <StyledTableCell sx={{ fontWeight: "bold" }}>Name</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: "bold" }}>Language</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: "bold" }}>Author</StyledTableCell>
            <StyledTableCell sx={{ fontWeight: "bold" }}>Conformance</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>{
          loading ? (
            <>
              {Array.from({ length: 10 }).map((_, index) => (
                <LoadingSnippetRow key={index} />
              ))}
            </>
          ) : (
            <>
              {
                snippets && snippets.map((snippet) => (
                  <SnippetRow data-testid={"snippet-row"}
                    onClick={() => handleClickSnippet(snippet.id)} key={snippet.id} snippet={snippet} />
                ))
              }
            </>
          )
        }
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination count={count} page={page} rowsPerPage={pageSize}
              onPageChange={(_, page) => handleGoToPage(page)}
              onRowsPerPageChange={e => handleChangePageSize(Number(e.target.value))} />
          </TableRow>
        </TableFooter>
      </Table>
      <AddSnippetModal defaultSnippet={snippet} open={addModalOpened}
        onClose={() => setAddModalOpened(false)} />
      <Menu anchorEl={popoverRef.current} open={popoverMenuOpened} onClick={handleClickMenu}>
        <MenuItem onClick={() => setAddModalOpened(true)}>Create snippet</MenuItem>
        <MenuItem onClick={() => inputRef?.current?.click()}>Load snippet from file</MenuItem>
      </Menu>
      <input hidden type={"file"} ref={inputRef} multiple={false} data-testid={"upload-file-input"}
        onChange={e => handleLoadSnippet(e?.target)} />
    </>
  )
}


export const StyledTableCell = styled(TableCell)`
    border: 0;
    align-items: center;
`
