import { ButtonGroup as ButtonGroup1 } from "./roving-tabindex-1"
import { ButtonGroup as ButtonGroup2 } from "./roving-tabindex-2"
import { ButtonGroup as ButtonGroup3 } from "./roving-tabindex-3"
import RovingTabindex4 from "./roving-tabindex-4";
import { ButtonGroup as ButtonGroup5 } from "./roving-tabindex-5"

function App() {

  return (
    <>
      <h1>Roving Tabindex 1</h1>
      <ButtonGroup1 />
      <h1>Roving Tabindex 2</h1>
      <ButtonGroup2 />
      <h1>Roving Tabindex 3</h1>
      <ButtonGroup3 />
      <h1>Roving Tabindex 4</h1>
      <RovingTabindex4 />
      <h1>Roving Tabindex 5</h1>
      <ButtonGroup5 />
    </>
  )
}

export default App
