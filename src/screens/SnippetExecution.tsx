import { OutlinedInput } from "@mui/material";
import { highlight, languages } from "prismjs";
import Editor from "react-simple-code-editor";
import { Bòx } from "../components/snippet-table/SnippetBox.tsx";
import { useState } from "react";

type SnippetExecutionProps = {
  output: string[];
}

export const SnippetExecution = ({ output }: SnippetExecutionProps) => {
  // Here you should provide all the logic to connect to your sockets.
  const [input, setInput] = useState<string>("")

  //TODO: get the output from the server
  const code = output.join("\n")

  const handleEnter = (event: { key: string }) => {
    if (event.key === 'Enter') {
      //TODO: logic to send inputs to server
      setInput("")
    }
  };

  return (
    <>
      <Bòx flex={1} overflow={"none"} minHeight={200} bgcolor={'black'} color={'white'} code={code}>
        <Editor
          value={code}
          padding={10}
          onValueChange={(code) => setInput(code)}
          highlight={(code) => highlight(code, languages.js, 'javascript')}
          maxLength={1000}
          style={{
            fontFamily: "monospace",
            fontSize: 17,
          }}
        />
      </Bòx>
      <OutlinedInput onKeyDown={handleEnter} value={input} onChange={e => setInput(e.target.value)} placeholder="Type here" fullWidth />
    </>
  )
}

export const SnippetExecutionTest = ({ output }: SnippetExecutionProps) => {
  const code = output.join("\n")

  return (
    <>
      <Bòx flex={1} overflow={"none"} minHeight={200} bgcolor={'black'} color={'white'} code={code}>
        <Editor
          value={code}
          padding={10}
          onValueChange={() => { }} // Read-only, no-op handler
          highlight={(code) => highlight(code, languages.js, 'javascript')}
          maxLength={1000}
          style={{
            fontFamily: "monospace",
            fontSize: 17,
          }}
        />
      </Bòx>
    </>
  )
}