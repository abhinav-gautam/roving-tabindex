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

type RovingTabindexContext = {
    focusableId: string | null
    setFocusableId: (id: string) => void
    onShiftTab: () => void
    getOrderedItems: () => RovingTabindexItem[]
    elements: MutableRefObject<Map<string, HTMLElement>>
}

// Added onShiftTab in context to track pressing of shit+tab
const RovingTabindexContext = createContext<RovingTabindexContext>({
    focusableId: null,
    setFocusableId: () => { },
    onShiftTab: () => { },
    getOrderedItems: () => [],
    elements: { current: new Map<string, HTMLElement>() },
})

type BaseButtonProps = {
    children: string
}

type ButtonProps = BaseButtonProps &
    Omit<ComponentPropsWithoutRef<'button'>, keyof BaseButtonProps>

export function Button(props: ButtonProps) {
    const {
        elements,
        getOrderedItems,
        setFocusableId,
        focusableId,
        onShiftTab,
    } = useContext(RovingTabindexContext)
    return (
        <button
            ref={element => {
                if (element) {
                    elements.current.set(props.children, element)
                } else {
                    elements.current.delete(props.children)
                }
            }}
            onKeyDown={e => {
                // On press of shift+tab, call onShiftTab (it makes isShiftTabbing to true)
                if (isHotkey('shift+tab', e)) {
                    onShiftTab()
                    return
                }
                if (isHotkey('right', e)) {
                    const items = getOrderedItems()
                    const currentIndex = items.findIndex(
                        item => item.element === e.currentTarget,
                    )
                    const nextItem = items.at(
                        currentIndex === items.length - 1
                            ? 0
                            : currentIndex + 1,
                    )
                    if (nextItem != null) {
                        nextItem.element.focus()
                        setFocusableId(nextItem.id)
                    }
                }
            }}
            tabIndex={props.children === focusableId ? 0 : -1}
            data-roving-tabindex-item
            {...props}
        >
            {props.children}
        </button>
    )
}

export function ButtonGroup() {
    // Initialized focusableId with null
    const [focusableId, setFocusableId] = useState<string | null>(null)

    // Hitting shit+tab from item moves focus to the wrapper div and its onFocus handler moves focus back to the item
    // To fix this we will toggle the tabindex of wrapper div between onKeyDown of Button and onBlur of ButtonGroup
    // Thats why isShiftTabbing functionality is required
    const [isShiftTabbing, setIsShiftTabbing] = useState(false)

    const elements = useRef(new Map<string, HTMLElement>())
    const ref = useRef<HTMLDivElement | null>(null)

    function getOrderedItems() {
        if (!ref.current) return []
        const elementsFromDOM = Array.from(
            ref.current.querySelectorAll<HTMLElement>('[data-roving-tabindex-item]'),
        )

        return Array.from(elements.current)
            .sort(
                (a, b) =>
                    elementsFromDOM.indexOf(a[1]) -
                    elementsFromDOM.indexOf(b[1]),
            )
            .map(([id, element]) => ({ id, element }))
    }

    return (
        <RovingTabindexContext.Provider
            value={{
                elements,
                getOrderedItems,
                setFocusableId,
                focusableId,

                // On press of shift tab set isShiftTabbing to true
                onShiftTab: function () {
                    // setIsShiftTabbing(true)
                },
            }}
        >
            <div
                ref={ref}

                // Making wrapper div not focusable while shift tabbing
                tabIndex={isShiftTabbing ? -1 : 0}

                // Handling focus for the wrapper div
                onFocus={e => {
                    // To make sure event is triggered from this div and not bubbled up from children
                    if (e.target !== e.currentTarget || isShiftTabbing) return

                    // Getting the items
                    const orderedItems = getOrderedItems()
                    if (orderedItems.length === 0) return

                    // If focusable id is initialized i.e. previously focused item is available then focusing it
                    // else focusing the first item
                    if (focusableId != null) {
                        elements.current.get(focusableId)?.focus()
                    } else {
                        orderedItems.at(0)?.element.focus()
                    }
                }}

                // Making wrapper div focusable again as soon as focus leaves the div
                onBlur={() => setIsShiftTabbing(false)}
            >
                <Button>button 1</Button>
                <Button>button 2</Button>
                <Button>button 3</Button>
            </div>
        </RovingTabindexContext.Provider>
    )
}

export default function App() {
    return (
        <div>
            <button>
                previous interactive element
            </button>
            <ButtonGroup />
        </div>
    )
}
