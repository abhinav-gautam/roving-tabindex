import isHotkey from 'is-hotkey'
import {
    MutableRefObject,
    createContext,
    ComponentPropsWithoutRef,
    useContext,
    useState,
    useRef,
    ElementType,
    ReactNode,
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

const RovingTabindexContext = createContext<RovingTabindexContext>({
    focusableId: null,
    setFocusableId: () => { },
    onShiftTab: () => { },
    getOrderedItems: () => [],
    elements: { current: new Map<string, HTMLElement>() },
})

// Moved everything related to roving tabindex in Button component into this hook
export const useRovingTabindex = (id: string) => {

    // Same - consuming context
    const {
        elements,
        getOrderedItems,
        setFocusableId,
        focusableId,
        onShiftTab,
    } = useContext(RovingTabindexContext)

    return {
        getOrderedItems,
        isFocusable: focusableId === id,
        // Generic prop getter so that the props returned match the DOM element they are applied to.
        // putting all the roving tabindex related props in the return of this prop getter
        getRovingProps: <T extends ElementType>(
            props: ComponentPropsWithoutRef<T>,
        ) => ({
            ...props,
            ref: (element: HTMLElement | null) => {
                if (element) {
                    elements.current.set(id, element)
                } else {
                    elements.current.delete(id)
                }
            },
            onMouseDown: (e: MouseEvent) => {
                props?.onMouseDown?.(e)
                if (e.target !== e.currentTarget) return
                // This is for Safari as it wont call onFocus on onClick event, 
                // so manually setting focusableId onMouseDown as well
                setFocusableId(id)
            },
            onKeyDown: (e: KeyboardEvent) => {
                props?.onKeyDown?.(e)
                if (e.target !== e.currentTarget) return
                if (isHotkey('shift+tab', e)) {
                    onShiftTab()
                    return
                }
            },
            onFocus: (e: FocusEvent) => {
                props?.onFocus?.(e)
                if (e.target !== e.currentTarget) return
                // Setting focusable id here, so we can just focus the node and it will automatically set the focusableId
                setFocusableId(id)
            },
            ['data-roving-tabindex-item']: true,
            tabIndex: focusableId === id ? 0 : -1,
        }),
    }
}

type RovingTabindexRootBaseProps<T> = {
    children: ReactNode | ReactNode[]
    as?: T
}

type RovingTabindexRootProps<T extends ElementType> =
    RovingTabindexRootBaseProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof RovingTabindexRootBaseProps<T>>

// Changing ButtonGroup to RovingTabindexRoot as a reusable polymorphic wrapper
export function RovingTabindexRoot<T extends ElementType>({
    children,
    as,
    ...props
}: RovingTabindexRootProps<T>) {
    // as prop for polymorphism, rest is same
    const Component = as ?? 'div'
    const [focusableId, setFocusableId] = useState<string | null>(null)
    const [isShiftTabbing, setIsShiftTabbing] = useState(false)
    const elements = useRef(new Map<string, HTMLElement>())
    const ref = useRef<HTMLDivElement | null>(null)

    // Same
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
                onShiftTab: function () {
                    setIsShiftTabbing(true)
                },
            }}
        >
            <Component
                {...props}
                ref={ref}
                tabIndex={isShiftTabbing ? -1 : 0}
                // Same
                onFocus={e => {
                    props?.onFocus?.(e)
                    if (e.target !== e.currentTarget || isShiftTabbing) return
                    const orderedItems = getOrderedItems()
                    if (orderedItems.length === 0) return

                    if (focusableId != null) {
                        elements.current.get(focusableId)?.focus()
                    } else {
                        orderedItems.at(0)?.element.focus()
                    }
                }}
                // Same
                onBlur={e => {
                    props?.onBlur?.(e)
                    setIsShiftTabbing(false)
                }}
            >
                {children}
            </Component>
        </RovingTabindexContext.Provider>
    )
}
