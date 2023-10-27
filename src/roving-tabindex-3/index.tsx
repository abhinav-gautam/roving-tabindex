import isHotkey from 'is-hotkey'
import {
    MutableRefObject,
    createContext,
    ComponentPropsWithoutRef,
    useContext,
    useState,
    useRef,
} from 'react'

type RovingTabindexItem = {
    id: string
    element: HTMLElement
}

// Type for the context
type RovingTabindexContext = {
    focusableId: string | null
    setFocusableId: (id: string) => void
    getOrderedItems: () => RovingTabindexItem[]
    elements: MutableRefObject<Map<string, HTMLElement>>
}

// Moved those three props as context
const RovingTabindexContext = createContext<RovingTabindexContext>({
    focusableId: null,
    setFocusableId: () => { },
    getOrderedItems: () => [],
    elements: { current: new Map<string, HTMLElement>() },
})

// Same but without focusable id and elements now
type BaseButtonProps = {
    children: string
}

type ButtonProps = BaseButtonProps &
    Omit<ComponentPropsWithoutRef<'button'>, keyof BaseButtonProps>

export function Button(props: ButtonProps) {
    // Get our items from the context
    const { elements, getOrderedItems, setFocusableId, focusableId } =
        useContext(RovingTabindexContext)

    return (
        <button
            // Same
            ref={element => {
                if (element) {
                    elements.current.set(props.children, element)
                } else {
                    elements.current.delete(props.children)
                }
            }}

            // Moved onKeyDown handler from parent to item level
            onKeyDown={e => {
                if (isHotkey('right', e)) {

                    // Getting the items from the parent's context
                    const items = getOrderedItems()

                    // Same
                    const currentIndex = items.findIndex(
                        item => item.element === e.currentTarget,
                    )
                    const nextItem = items.at(
                        currentIndex === items.length - 1
                            ? 0
                            : currentIndex + 1,
                    )

                    // Same
                    if (nextItem != null) {
                        nextItem.element.focus()
                        setFocusableId(nextItem.id)
                    }
                }
            }}

            // Same
            tabIndex={props.children === focusableId ? 0 : -1}
            data-roving-tabindex-item
            {...props}
        >
            {props.children}
        </button>
    )
}

export const ButtonGroup = () => {
    const [focusableId, setFocusableId] = useState('button 1')
    const elements = useRef(new Map<string, HTMLElement>())
    const ref = useRef<HTMLDivElement | null>(null)

    // This function finds the elements from the DOM based on custom attribute
    // earlier this was done in onKeyDown handler, now this will be passed in the context
    function getOrderedItems() {
        if (!ref.current) return []

        // Same
        const elementsFromDOM = Array.from(
            ref.current.querySelectorAll<HTMLElement>('[data-roving-tabindex-item]'),
        )

        // Same - returning the sorted items
        return Array.from(elements.current)
            .sort(
                (a, b) =>
                    elementsFromDOM.indexOf(a[1]) -
                    elementsFromDOM.indexOf(b[1]),
            )
            .map(([id, element]) => ({ id, element }))
    }

    return (
        // Setting the values of the context in the provider and then it will be available to all the children
        <RovingTabindexContext.Provider
            value={{ elements, getOrderedItems, setFocusableId, focusableId }}
        >
            <div ref={ref}>
                <Button>button 1</Button>
                <Button>button 2</Button>
                <Button>button 3</Button>
            </div>
        </RovingTabindexContext.Provider>
    )
}
