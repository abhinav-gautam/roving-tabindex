import { useRef, useState, type KeyboardEvent } from "react"
import isHotkey from 'is-hotkey';

export const ButtonGroup = () => {
    // focusableId to track and update tabindex
    const [focusableId, setFocusableId] = useState('button 1')

    // options to generate buttons
    const [options] = useState(['button 1', 'button 2', 'button 3'])

    // ref of buttons, map is used to save as key value pair
    const elements = useRef(new Map<string, HTMLElement>())

    return (
        <div>
            {options.map((button, key) => (
                <button
                    key={key}
                    onKeyDown={(e: KeyboardEvent) => {
                        // On press of right key
                        if (isHotkey('right', e)) {
                            // finding the index of current and next button
                            const currentIndex = options.findIndex(
                                text => text === button,
                            )
                            const nextIndex =
                                currentIndex === options.length - 1
                                    ? 0
                                    : currentIndex + 1

                            const nextOption = options.at(nextIndex)

                            // Focusing the button and setting focusableId so that tabindex can be updated
                            if (nextOption) {
                                elements.current.get(nextOption)?.focus()
                                setFocusableId(nextOption)
                            }
                        }
                    }}
                    tabIndex={button === focusableId ? 0 : -1}
                    ref={element => {
                        // Set and clean ref as buttons get mounted/unmounted
                        if (element) {
                            elements.current.set(button, element)
                        } else {
                            elements.current.delete(button)
                        }
                    }}
                >
                    {button}
                </button>
            ))}
        </div>
    )
}