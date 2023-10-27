import { useRef, useState, type KeyboardEvent, MutableRefObject, ComponentPropsWithoutRef } from "react";
import isHotkey from 'is-hotkey';

type BaseButtonProps = {
    children: string
    focusableId: string
    elements: MutableRefObject<Map<string, HTMLElement>>
}

// ButtonProps contains all the attributes accepted by html button and BaseButtonProps
type ButtonProps = BaseButtonProps &
    Omit<ComponentPropsWithoutRef<'button'>, keyof BaseButtonProps>

export const Button = (props: ButtonProps) => {
    return (
        <button
            // Same 
            ref={element => {
                if (element) {
                    props.elements.current.set(props.children, element)
                } else {
                    props.elements.current.delete(props.children)
                }
            }}
            // Same
            tabIndex={props.children === props.focusableId ? 0 : -1}
            // Used to find by query selector
            data-roving-tabindex-item
            {...props}
        >
            {props.children}
        </button>
    )
}

export const ButtonGroup = () => {
    // Same
    const [focusableId, setFocusableId] = useState('button 1')
    const elementsRef = useRef(new Map<string, HTMLElement>())

    // Ref for button group
    const ref = useRef<HTMLDivElement | null>(null)

    // Extracted onKeyDown handler
    function onKeyDown(e: KeyboardEvent) {
        if (isHotkey('right', e)) {
            if (!ref.current) return

            // Getting elements from dom based on custom attribute
            const elements = Array.from(
                ref.current.querySelectorAll<HTMLElement>(
                    '[data-roving-tabindex-item]',
                ),
            )

            // Sorting the items
            const items = Array.from(elementsRef.current)
                .sort((a, b) => elements.indexOf(a[1]) - elements.indexOf(b[1]))
                .map(([id, element]) => ({ id, element }))

            // Same
            const currentIndex = items.findIndex(
                item => item.element === e.currentTarget,
            )
            const nextItem = items.at(
                currentIndex === items.length - 1 ? 0 : currentIndex + 1,
            )

            // Same
            if (nextItem?.id != null) {
                nextItem.element.focus()
                setFocusableId(nextItem.id)
            }
        }
    }

    return (
        <div ref={ref}>
            <Button
                focusableId={focusableId}
                elements={elementsRef}
                onKeyDown={onKeyDown}
            >
                button 1
            </Button>
            <span>hello</span>
            <Button
                focusableId={focusableId}
                elements={elementsRef}
                onKeyDown={onKeyDown}
            >
                button 2
            </Button>
            <span>world</span>
            <Button
                focusableId={focusableId}
                elements={elementsRef}
                onKeyDown={onKeyDown}
            >
                button 3
            </Button>
        </div>
    )
}