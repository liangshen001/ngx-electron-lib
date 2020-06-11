export interface TrayProxy {
    on(event: 'click' | 'balloon-click' | 'balloon-closed' | 'balloon-show' | 'drag-end' | 'drag-enter'
        | 'drag-leave' | 'drop', listener: Function);

    once(event: 'click' | 'balloon-click' | 'balloon-closed' | 'balloon-show' | 'drag-end' | 'drag-enter'
        | 'drag-leave' | 'drop', listener: Function);


    on(event: 'click', listener: (event: Event,
                                  bounds: Rectangle,
                                  position: Point) => void);

    once(event: 'click', listener: (event: Event,
                                    bounds: Rectangle,
                                    position: Point) => void);

    on(event: 'double-click', listener: (event: Event,
                                         bounds: Rectangle) => void);
    once(event: 'double-click', listener: (event: Event,
                                         bounds: Rectangle) => void);
    on(event: 'drop-files', listener: (event: Event,
                                       files: string[]) => void);
    once(event: 'drop-files', listener: (event: Event,
                                       files: string[]) => void);
    on(event: 'drop-text', listener: (event: Event,
                                      text: string) => void);
    once(event: 'drop-text', listener: (event: Event,
                                      text: string) => void);
    on(event: 'mouse-enter' | 'mouse-leave' | 'mouse-move' | 'right-click', listener: (event: Event,
                                                        position: Point) => void);
    once(event: 'mouse-enter' | 'mouse-leave' | 'mouse-move' | 'right-click', listener: (event: Event,
                                                        position: Point) => void);
    destroy(): void;
    // /**
    //  * Displays a tray balloon.
    //  */
    // displayBalloon(options: DisplayBalloonOptions): void;
    // /**
    //  * The bounds of this tray icon as Object.
    //  */
    // getBounds(): Rectangle;
    // isDestroyed(): boolean;
    // /**
    //  * Pops up the context menu of the tray icon. When menu is passed, the menu will be
    //  * shown instead of the tray icon's context menu. The position is only available on
    //  * Windows, and it is (0, 0) by default.
    //  */
    // popUpContextMenu(menu?: Menu, position?: Point): void;
    // /**
    //  * Sets the context menu for this icon.
    //  */
    // setContextMenu(menu: Menu): void;
    /**
     * Sets when the tray's icon background becomes highlighted (in blue). Note: You
     * can use highlightMode with a BrowserWindow by toggling between 'never' and
     * 'always' modes when the window visibility changes.
     */
    setHighlightMode(mode: 'selection' | 'always' | 'never'): void;
    /**
     * 图片可以来自于网络指定isWeb=true
     */
    setImage(imageUrl: string, isWeb?: boolean): void;
    /**
     * Sets the image associated with this tray icon when pressed on macOS.
     */
    // setPressedImage(image: NativeImage): void;
    /**
     * Sets the title displayed aside of the tray icon in the status bar (Support ANSI
     * colors).
     */
    setTitle(title: string): void;
    /**
     * Sets the hover text for this tray icon.
     */
    setToolTip(toolTip: string): void;
    setContextMenuTemplate(template: any[]): void;
}

export interface Rectangle {
    height: number;
    /**
     * The width of the rectangle (must be an integer)
     */
    width: number;
    /**
     * The x coordinate of the origin of the rectangle (must be an integer)
     */
    x: number;
    /**
     * The y coordinate of the origin of the rectangle (must be an integer)
     */
    y: number;
}
export interface Point {
    // Docs: http://electron.atom.io/docs/api/structures/point
    x: number;
    y: number;
}
