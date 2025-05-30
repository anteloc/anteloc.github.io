import { Pointer } from "./mupdf-wasm.js";
declare global {
    var $libmupdf_wasm_Module: any;
}
export type Matrix = [number, number, number, number, number, number];
export type Rect = [number, number, number, number];
export type Quad = [number, number, number, number, number, number, number, number];
export type Point = [number, number];
export type Color = [number] | [number, number, number] | [number, number, number, number];
export type Rotate = 0 | 90 | 180 | 270;
export declare const Matrix: {
    identity: Matrix;
    scale(sx: number, sy: number): Matrix;
    translate(tx: number, ty: number): Matrix;
    rotate(d: number): Matrix;
    invert(m: Matrix): Matrix;
    concat(one: Matrix, two: Matrix): Matrix;
};
export declare const Rect: {
    MIN_INF_RECT: number;
    MAX_INF_RECT: number;
    isEmpty: (rect: Rect) => boolean;
    isValid: (rect: Rect) => boolean;
    isInfinite: (rect: Rect) => boolean;
    transform: (rect: Rect, matrix: Matrix) => Rect;
};
export declare function enableICC(): void;
export declare function disableICC(): void;
export declare function setUserCSS(text: string): void;
export declare function installLoadFontFunction(f: (name: string, script: string) => Buffer | null): void;
/** The types that can be automatically converted into a Buffer object */
type AnyBuffer = Buffer | ArrayBuffer | Uint8Array | string;
declare abstract class Userdata<B> {
    private static _finalizer;
    static readonly _drop: (pointer: any) => void;
    pointer: Pointer<B>;
    constructor(pointer: Pointer<B>);
    destroy(): void;
    toString(): string;
    valueOf(): void;
}
export declare class Buffer extends Userdata<"fz_buffer"> {
    static readonly _drop: (p: Pointer<"fz_buffer">) => void;
    /** New empty Buffer. */
    constructor();
    /** New Buffer initialized with string contents as UTF-8. */
    constructor(data: string);
    /** New Buffer initialized with typed array contents. */
    constructor(data: ArrayBuffer | Uint8Array);
    /** PRIVATE */
    constructor(pointer: Pointer<"fz_buffer">);
    getLength(): number;
    readByte(at: number): number;
    write(s: string): void;
    writeByte(b: number): void;
    writeLine(s: string): void;
    writeBuffer(other: AnyBuffer): void;
    asUint8Array(): Uint8Array;
    slice(start: number, end: number): Buffer;
    asString(): string;
    save(filename: string): void;
}
export type ColorSpaceType = "None" | "Gray" | "RGB" | "BGR" | "CMYK" | "Lab" | "Indexed" | "Separation";
export declare class ColorSpace extends Userdata<"fz_colorspace"> {
    static readonly _drop: (p: Pointer<"fz_colorspace">) => void;
    static readonly COLORSPACE_TYPES: ColorSpaceType[];
    constructor(profile: AnyBuffer, name: string);
    constructor(pointer: Pointer<"fz_colorspace">);
    getName(): string;
    getType(): ColorSpaceType;
    getNumberOfComponents(): number;
    isGray(): boolean;
    isRGB(): boolean;
    isCMYK(): boolean;
    isIndexed(): boolean;
    isLab(): boolean;
    isDeviceN(): boolean;
    isSubtractive(): boolean;
    toString(): string;
    static readonly DeviceGray: ColorSpace;
    static readonly DeviceRGB: ColorSpace;
    static readonly DeviceBGR: ColorSpace;
    static readonly DeviceCMYK: ColorSpace;
    static readonly Lab: ColorSpace;
}
export type FontSimpleEncoding = "Latin" | "Greek" | "Cyrillic";
export type FontCJKOrdering = 0 | 1 | 2 | 3;
export type FontCJKLanguage = "Adobe-CNS1" | "Adobe-GB1" | "Adobe-Japan1" | "Adobe-Korea1" | "zh-Hant" | "zh-TW" | "zh-HK" | "zh-Hans" | "zh-CN" | "ja" | "ko";
export declare class Font extends Userdata<"fz_font"> {
    static readonly _drop: (p: Pointer<"fz_font">) => void;
    static readonly SIMPLE_ENCODING: FontSimpleEncoding[];
    static readonly ADOBE_CNS = 0;
    static readonly ADOBE_GB = 1;
    static readonly ADOBE_JAPAN = 2;
    static readonly ADOBE_KOREA = 3;
    static readonly CJK_ORDERING_BY_LANG: Record<FontCJKLanguage, FontCJKOrdering>;
    constructor(name: string);
    constructor(name: string, data: AnyBuffer, subfont?: number);
    constructor(pointer: Pointer<"fz_font">);
    getName(): string;
    encodeCharacter(uni: number | string): number;
    advanceGlyph(gid: number, wmode?: number): number;
    isMono(): boolean;
    isSerif(): boolean;
    isBold(): boolean;
    isItalic(): boolean;
}
export declare class Image extends Userdata<"fz_image"> {
    static readonly _drop: (p: Pointer<"fz_image">) => void;
    constructor(pointer: Pointer<"fz_image">);
    constructor(data: AnyBuffer);
    constructor(pixmap: Pixmap, mask?: Image);
    getWidth(): number;
    getHeight(): number;
    getNumberOfComponents(): number;
    getBitsPerComponent(): number;
    getXResolution(): number;
    getYResolution(): number;
    getImageMask(): boolean;
    getColorSpace(): ColorSpace | null;
    getMask(): Image | null;
    toPixmap(): Pixmap;
}
export type LineCap = "Butt" | "Round" | "Square" | "Triangle";
export type LineJoin = "Miter" | "Round" | "Bevel" | "MiterXPS";
export declare class StrokeState extends Userdata<"fz_stroke_state"> {
    static readonly _drop: (p: Pointer<"fz_stroke_state">) => void;
    static readonly LINE_CAP: LineCap[];
    static readonly LINE_JOIN: LineJoin[];
    constructor(pointer?: Pointer<"fz_stroke_state">);
    getLineCap(): number;
    setLineCap(j: LineCap): void;
    getLineJoin(): number;
    setLineJoin(j: LineJoin): void;
    getLineWidth(): number;
    setLineWidth(w: number): void;
    getMiterLimit(): number;
    setMiterLimit(m: number): void;
}
interface PathWalker {
    moveTo?(x: number, y: number): void;
    lineTo?(x: number, y: number): void;
    curveTo?(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
    closePath?(): void;
}
export declare class Path extends Userdata<"fz_path"> {
    static readonly _drop: (p: Pointer<"fz_path">) => void;
    constructor(pointer?: Pointer<"fz_path">);
    getBounds(strokeState: StrokeState, transform: Matrix): Rect;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    curveTo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
    curveToV(cx: number, cy: number, ex: number, ey: number): void;
    curveToY(cx: number, cy: number, ex: number, ey: number): void;
    closePath(): void;
    rect(x1: number, y1: number, x2: number, y2: number): void;
    transform(matrix: Matrix): void;
    walk(walker: PathWalker): void;
}
interface TextWalker {
    beginSpan?(font: Font, trm: Matrix, wmode: number, bidi: number, markupDirection: number, language: string): void;
    showGlyph?(font: Font, trm: Matrix, glyph: number, unicode: number, wmode: number, bidi: number): void;
    endSpan?(): void;
}
export declare class Text extends Userdata<"fz_text"> {
    static readonly _drop: (p: Pointer<"fz_text">) => void;
    constructor(pointer?: Pointer<"fz_text">);
    getBounds(strokeState: StrokeState, transform: Matrix): Rect;
    showGlyph(font: Font, trm: Matrix, gid: number, uni: number, wmode?: number): void;
    showString(font: Font, trm: Matrix, str: string, wmode?: number): Matrix;
    walk(walker: TextWalker): void;
}
export declare class DisplayList extends Userdata<"fz_display_list"> {
    static readonly _drop: (p: Pointer<"fz_display_list">) => void;
    constructor(pointer: Pointer<"fz_display_list">);
    constructor(mediabox: Rect);
    getBounds(): Rect;
    toPixmap(matrix: Matrix, colorspace: ColorSpace, alpha?: boolean): Pixmap;
    toStructuredText(options?: string): StructuredText;
    run(device: Device, matrix: Matrix): void;
    search(needle: string, max_hits?: number): Quad[][];
}
export declare class Pixmap extends Userdata<"fz_pixmap"> {
    static readonly _drop: (p: Pointer<"fz_pixmap">) => void;
    constructor(pointer: Pointer<"fz_pixmap">);
    constructor(colorspace: ColorSpace, bbox: Rect, alpha: boolean);
    getBounds(): number[];
    clear(value?: number): void;
    getWidth(): number;
    getHeight(): number;
    getX(): number;
    getY(): number;
    getStride(): number;
    getNumberOfComponents(): number;
    getAlpha(): number;
    getXResolution(): number;
    getYResolution(): number;
    setResolution(x: number, y: number): void;
    getColorSpace(): ColorSpace | null;
    getPixels(): Uint8ClampedArray;
    asPNG(): Uint8Array;
    asPSD(): Uint8Array;
    asPAM(): Uint8Array;
    asJPEG(quality: number, invert_cmyk: boolean): Uint8Array;
    invert(): void;
    invertLuminance(): void;
    gamma(p: number): void;
    tint(black: number | Color, white: number | Color): void;
    convertToColorSpace(colorspace: ColorSpace, keepAlpha?: boolean): Pixmap;
    warp(points: Point[], width: number, height: number): Pixmap;
}
export declare class Shade extends Userdata<"fz_shade"> {
    static readonly _drop: (p: Pointer<"fz_shade">) => void;
    getBounds(): Rect;
}
interface StructuredTextWalker {
    onImageBlock?(bbox: Rect, transform: Matrix, image: Image): void;
    beginTextBlock?(bbox: Rect): void;
    beginLine?(bbox: Rect, wmode: number, direction: Point): void;
    onChar?(c: string, origin: Point, font: Font, size: number, quad: Quad, color: Color): void;
    endLine?(): void;
    endTextBlock?(): void;
}
type SelectMode = "chars" | "words" | "lines";
export declare class StructuredText extends Userdata<"fz_stext_page"> {
    static readonly _drop: (p: Pointer<"fz_stext_page">) => void;
    static readonly SELECT_MODE: SelectMode[];
    static readonly SELECT_CHARS = "chars";
    static readonly SELECT_WORDS = "words";
    static readonly SELECT_LINES = "lines";
    walk(walker: StructuredTextWalker): void;
    asJSON(scale?: number): string;
    asHTML(id: number): string;
    asText(): string;
    snap(p: Point, q: Point, mode: SelectMode): Quad;
    copy(p: Point, q: Point): string;
    highlight(p: Point, q: Point, max_hits?: number): Quad[];
    search(needle: string, max_hits?: number): Quad[][];
}
export type BlendMode = "Normal" | "Multiply" | "Screen" | "Overlay" | "Darken" | "Lighten" | "ColorDodge" | "ColorBurn" | "HardLight" | "SoftLight" | "Difference" | "Exclusion" | "Hue" | "Saturation" | "Color" | "Luminosity";
export declare class Device extends Userdata<"fz_device"> {
    static readonly _drop: (p: Pointer<"fz_device">) => void;
    static readonly BLEND_MODES: BlendMode[];
    constructor(pointer: Pointer<"fz_device">);
    constructor(callbacks: DeviceFunctions);
    fillPath(path: Path, evenOdd: boolean, ctm: Matrix, colorspace: ColorSpace, color: Color, alpha: number): void;
    strokePath(path: Path, stroke: StrokeState, ctm: Matrix, colorspace: ColorSpace, color: Color, alpha: number): void;
    clipPath(path: Path, evenOdd: boolean, ctm: Matrix): void;
    clipStrokePath(path: Path, stroke: StrokeState, ctm: Matrix): void;
    fillText(text: Text, ctm: Matrix, colorspace: ColorSpace, color: Color, alpha: number): void;
    strokeText(text: Text, stroke: StrokeState, ctm: Matrix, colorspace: ColorSpace, color: Color, alpha: number): void;
    clipText(text: Text, ctm: Matrix): void;
    clipStrokeText(text: Text, stroke: StrokeState, ctm: Matrix): void;
    ignoreText(text: Text, ctm: Matrix): void;
    fillShade(shade: Shade, ctm: Matrix, alpha: number): void;
    fillImage(image: Image, ctm: Matrix, alpha: number): void;
    fillImageMask(image: Image, ctm: Matrix, colorspace: ColorSpace, color: Color, alpha: number): void;
    clipImageMask(image: Image, ctm: Matrix): void;
    popClip(): void;
    beginMask(area: Rect, luminosity: boolean, colorspace: ColorSpace, color: Color): void;
    endMask(): void;
    beginGroup(area: Rect, colorspace: ColorSpace, isolated: boolean, knockout: boolean, blendmode: BlendMode, alpha: number): void;
    endGroup(): void;
    beginTile(area: Rect, view: Rect, xstep: number, ystep: number, ctm: Matrix, id: number): number;
    endTile(): void;
    beginLayer(name: string): void;
    endLayer(): void;
    close(): void;
}
export declare class DrawDevice extends Device {
    constructor(matrix: Matrix, pixmap: Pixmap);
}
export declare class DisplayListDevice extends Device {
    constructor(displayList: DisplayList);
}
export declare class DocumentWriter extends Userdata<"fz_document_writer"> {
    static readonly _drop: (p: Pointer<"fz_document_writer">) => void;
    constructor(buffer: Buffer, format: string, options: string);
    beginPage(mediabox: Rect): Device;
    endPage(): void;
    close(): void;
}
export type DocumentPermission = "print" | "copy" | "edit" | "annotate" | "form" | "accessibility" | "assemble" | "print-hq";
export declare class Document extends Userdata<"any_document"> {
    static readonly _drop: (p: Pointer<"any_document">) => void;
    static readonly META_FORMAT = "format";
    static readonly META_ENCRYPTION = "encryption";
    static readonly META_INFO_AUTHOR = "info:Author";
    static readonly META_INFO_TITLE = "info:Title";
    static readonly META_INFO_SUBJECT = "info:Subject";
    static readonly META_INFO_KEYWORDS = "info:Keywords";
    static readonly META_INFO_CREATOR = "info:Creator";
    static readonly META_INFO_PRODUCER = "info:Producer";
    static readonly META_INFO_CREATIONDATE = "info:CreationDate";
    static readonly META_INFO_MODIFICATIONDATE = "info:ModDate";
    static readonly PERMISSION: Record<DocumentPermission, number>;
    static readonly LINK_DEST: LinkDestType[];
    static openDocument(from: Buffer | ArrayBuffer | Uint8Array | Stream | string, magic?: string): Document;
    formatLinkURI(dest: LinkDest): string;
    isPDF(): boolean;
    needsPassword(): boolean;
    authenticatePassword(password: string): number;
    hasPermission(perm: DocumentPermission): boolean;
    getMetaData(key: string): string | undefined;
    setMetaData(key: string, value: string): void;
    countPages(): number;
    isReflowable(): void;
    layout(w: number, h: number, em: number): void;
    loadPage(index: number): PDFPage | Page;
    loadOutline(): OutlineItem[] | null;
    resolveLink(link: string | Link): number;
    resolveLinkDestination(link: string | Link): LinkDest;
    outlineIterator(): OutlineIterator;
}
interface OutlineItem {
    title: string | undefined;
    uri: string | undefined;
    open: boolean;
    down?: OutlineItem[];
    page?: number;
}
export declare class OutlineIterator extends Userdata<"fz_outline_iterator"> {
    static readonly _drop: (p: Pointer<"fz_outline_iterator">) => void;
    static readonly RESULT_DID_NOT_MOVE = -1;
    static readonly RESULT_AT_ITEM = 0;
    static readonly RESULT_AT_EMPTY = 1;
    item(): OutlineItem | null;
    next(): number;
    prev(): number;
    up(): number;
    down(): number;
    delete(): number;
    insert(item: OutlineItem): number;
    update(item: OutlineItem): void;
}
export type LinkDestType = "Fit" | "FitB" | "FitH" | "FitBH" | "FitV" | "FitBV" | "FitR" | "XYZ";
interface LinkDest {
    type: LinkDestType;
    chapter: number;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
}
export declare class Link extends Userdata<"fz_link"> {
    static readonly _drop: (p: Pointer<"fz_link">) => void;
    getBounds(): Rect;
    setBounds(rect: Rect): void;
    getURI(): string;
    setURI(uri: string): void;
    isExternal(): boolean;
}
export type PageBox = "MediaBox" | "CropBox" | "BleedBox" | "TrimBox" | "ArtBox";
export declare class Page extends Userdata<"any_page"> {
    static readonly _drop: (p: Pointer<"any_page">) => void;
    static readonly BOXES: PageBox[];
    isPDF(): boolean;
    getBounds(box?: PageBox): Rect;
    getLabel(): string;
    run(device: Device, matrix: Matrix): void;
    runPageContents(device: Device, matrix: Matrix): void;
    runPageAnnots(device: Device, matrix: Matrix): void;
    runPageWidgets(device: Device, matrix: Matrix): void;
    toPixmap(matrix: Matrix, colorspace: ColorSpace, alpha?: boolean, showExtras?: boolean): Pixmap;
    toDisplayList(showExtras?: boolean): DisplayList;
    toStructuredText(options?: string): StructuredText;
    getLinks(): Link[];
    createLink(bbox: Rect, uri: string): Link;
    deleteLink(link: Link): void;
    search(needle: string, max_hits?: number): Quad[][];
}
export declare class PDFDocument extends Document {
    constructor();
    constructor(filename: string);
    constructor(data: Buffer | ArrayBuffer | Uint8Array | Stream);
    constructor(clone: PDFDocument);
    constructor(pointer: Pointer<"any_document">);
    constructor(data: Buffer | ArrayBuffer | Uint8Array | Stream);
    loadPage(index: number): PDFPage;
    _fromPDFObjectNew(ptr: Pointer<"pdf_obj">): PDFObject;
    _fromPDFObjectKeep(ptr: Pointer<"pdf_obj">): PDFObject;
    _toPDFObject(obj: any): PDFObject;
    _PDFOBJ(obj: any): Pointer<"pdf_obj">;
    getVersion(): number;
    getLanguage(): string;
    setLanguage(lang: string): void;
    countObjects(): number;
    getTrailer(): PDFObject;
    createObject(): PDFObject;
    newNull(): PDFObject;
    newBoolean(v: boolean): PDFObject;
    newInteger(v: number): PDFObject;
    newReal(v: number): PDFObject;
    newName(v: string): PDFObject;
    newString(v: string): PDFObject;
    newByteString(v: Uint8Array): PDFObject;
    newIndirect(v: number): PDFObject;
    newArray(cap?: number): PDFObject;
    newDictionary(cap?: number): PDFObject;
    deleteObject(num: number | PDFObject): void;
    addObject(obj: any): PDFObject;
    addStream(buf: AnyBuffer, obj: any): PDFObject;
    addRawStream(buf: AnyBuffer, obj: any): PDFObject;
    newGraftMap(): PDFGraftMap;
    graftObject(obj: PDFObject): PDFObject;
    graftPage(to: number, srcDoc: PDFDocument, srcPage: number): void;
    addSimpleFont(font: Font, encoding?: FontSimpleEncoding): PDFObject;
    addCJKFont(font: Font, lang: FontCJKOrdering | FontCJKLanguage, wmode?: number, serif?: boolean): PDFObject;
    addFont(font: Font): PDFObject;
    addImage(image: Image): PDFObject;
    loadImage(ref: PDFObject): Image;
    findPage(index: number): PDFObject;
    addPage(mediabox: Rect, rotate: Rotate, resources: any, contents: AnyBuffer): PDFObject;
    insertPage(at: number, obj: PDFObject): void;
    deletePage(at: number): void;
    isEmbeddedFile(ref: PDFObject): number;
    addEmbeddedFile(filename: string, mimetype: string, contents: AnyBuffer, created: Date, modified: Date, checksum?: boolean): PDFObject;
    getEmbeddedFileParams(ref: PDFObject): {
        filename: string;
        mimetype: string;
        size: Pointer<"char">;
        creationDate: Date;
        modificationDate: Date;
    };
    getEmbeddedFileContents(ref: PDFObject): Buffer | null;
    getEmbeddedFiles(): Record<string, PDFObject>;
    loadNameTree(treeName: string): Record<string, PDFObject>;
    insertEmbeddedFile(filename: string, filespec: PDFObject): void;
    deleteEmbeddedFile(filename: string): void;
    _rewriteEmbeddedFiles(efs: Record<string, PDFObject>): void;
    saveToBuffer(options?: string | Record<string, any>): Buffer;
    save(filename: string, options?: string | Record<string, any>): void;
    static readonly PAGE_LABEL_NONE = "\0";
    static readonly PAGE_LABEL_DECIMAL = "D";
    static readonly PAGE_LABEL_ROMAN_UC = "R";
    static readonly PAGE_LABEL_ROMAN_LC = "r";
    static readonly PAGE_LABEL_ALPHA_UC = "A";
    static readonly PAGE_LABEL_ALPHA_LC = "a";
    setPageLabels(index: number, style?: string, prefix?: string, start?: number): void;
    deletePageLabels(index: number): void;
    wasRepaired(): boolean;
    hasUnsavedChanges(): boolean;
    countVersions(): number;
    countUnsavedVersions(): number;
    validateChangeHistory(): number;
    canBeSavedIncrementally(): boolean;
    enableJournal(): void;
    getJournal(): {
        position: number;
        steps: string[];
    };
    beginOperation(op: string): void;
    beginImplicitOperation(): void;
    endOperation(): void;
    abandonOperation(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    undo(): void;
    redo(): void;
    isJSSupported(): boolean;
    enableJS(): void;
    disableJS(): void;
    setJSEventListener(_listener: any): void;
    rearrangePages(pages: number[]): void;
    subsetFonts(): void;
    bake(bakeAnnots?: boolean, bakeWidgets?: boolean): void;
    countLayers(): number;
    isLayerVisible(layer: number): boolean;
    setLayerVisible(layer: number, visible: boolean): void;
    getLayerName(layer: number): string;
    resetForm(fields: PDFObject, exclude: boolean): void;
}
export declare class PDFPage extends Page {
    _doc: PDFDocument;
    _annots: PDFAnnotation[] | null;
    _widgets: PDFWidget[] | null;
    constructor(doc: PDFDocument, clone: PDFPage);
    constructor(doc: PDFDocument, pointer: Pointer<"any_page">);
    getObject(): PDFObject;
    getTransform(): Matrix;
    setPageBox(box: PageBox, rect: Rect): void;
    toPixmap(matrix: Matrix, colorspace: ColorSpace, alpha?: boolean, showExtras?: boolean, usage?: string, box?: PageBox): Pixmap;
    getWidgets(): PDFWidget[];
    getAnnotations(): PDFAnnotation[];
    createAnnotation(type: PDFAnnotationType): PDFAnnotation;
    deleteAnnotation(annot: PDFAnnotation): void;
    static readonly REDACT_IMAGE_NONE = 0;
    static readonly REDACT_IMAGE_REMOVE = 1;
    static readonly REDACT_IMAGE_PIXELS = 2;
    static readonly REDACT_IMAGE_UNLESS_INVISIBLE = 3;
    static readonly REDACT_LINE_ART_NONE = 0;
    static readonly REDACT_LINE_ART_REMOVE_IF_COVERED = 1;
    static readonly REDACT_LINE_ART_REMOVE_IF_TOUCHED = 2;
    static readonly REDACT_TEXT_REMOVE = 0;
    static readonly REDACT_TEXT_NONE = 1;
    applyRedactions(black_boxes?: boolean, image_method?: number, line_art_method?: number, text_method?: number): void;
    update(): boolean;
}
type PDFObjectPath = Array<number | string | PDFObject>;
export declare class PDFObject extends Userdata<"pdf_obj"> {
    static readonly _drop: (p: Pointer<"pdf_obj">) => void;
    static readonly Null: PDFObject;
    _doc: PDFDocument;
    constructor(doc: PDFDocument, pointer: Pointer<"pdf_obj">);
    isNull(): boolean;
    isIndirect(): boolean;
    isBoolean(): boolean;
    isInteger(): boolean;
    isNumber(): boolean;
    isName(): boolean;
    isString(): boolean;
    isArray(): boolean;
    isDictionary(): boolean;
    isStream(): boolean;
    asIndirect(): number;
    asBoolean(): boolean;
    asNumber(): number;
    asName(): string;
    asString(): string;
    asByteString(): Uint8Array;
    readStream(): Buffer;
    readRawStream(): Buffer;
    writeObject(obj: any): void;
    writeStream(buf: AnyBuffer): void;
    writeRawStream(buf: AnyBuffer): void;
    resolve(): PDFObject;
    get length(): Pointer<"pdf_obj">;
    _get(path: PDFObjectPath): Pointer<"pdf_obj">;
    get(...path: PDFObjectPath): PDFObject;
    getIndirect(...path: PDFObjectPath): number;
    getBoolean(...path: PDFObjectPath): boolean;
    getNumber(...path: PDFObjectPath): number;
    getName(...path: PDFObjectPath): string;
    getString(...path: PDFObjectPath): string;
    getInheritable(key: string | PDFObject): PDFObject;
    put(key: number | string | PDFObject, value: any): any;
    push(value: any): any;
    delete(key: number | string | PDFObject): void;
    valueOf(): string | number | boolean | this | null;
    toString(tight?: boolean, ascii?: boolean): string;
    forEach(fn: (val: PDFObject, key: number | string, self: PDFObject) => void): void;
    asJS(seen?: Record<number, PDFObject>): any;
}
export declare class PDFGraftMap extends Userdata<"pdf_graft_map"> {
    static readonly _drop: (p: Pointer<"pdf_graft_map">) => void;
    _doc: PDFDocument;
    constructor(doc: PDFDocument, pointer: Pointer<"pdf_graft_map">);
    graftObject(obj: PDFObject): PDFObject;
    graftPage(to: number, srcDoc: PDFDocument, srcPage: number): void;
}
export type PDFAnnotationType = "Text" | "Link" | "FreeText" | "Line" | "Square" | "Circle" | "Polygon" | "PolyLine" | "Highlight" | "Underline" | "Squiggly" | "StrikeOut" | "Redact" | "Stamp" | "Caret" | "Ink" | "Popup" | "FileAttachment" | "Sound" | "Movie" | "RichMedia" | "Widget" | "Screen" | "PrinterMark" | "TrapNet" | "Watermark" | "3D" | "Projection";
export type PDFAnnotationLineEndingStyle = "None" | "Square" | "Circle" | "Diamond" | "OpenArrow" | "ClosedArrow" | "Butt" | "ROpenArrow" | "RClosedArrow" | "Slash";
export type PDFAnnotationBorderStyle = "Solid" | "Dashed" | "Beveled" | "Inset" | "Underline";
export type PDFAnnotationBorderEffect = "None" | "Cloudy";
export type PDFAnnotationIntent = null | "FreeTextCallout" | "FreeTextTypeWriter" | "LineArrow" | "LineDimension" | "PloyLine" | "PolygonCloud" | "PolygonDimension" | "StampImage" | "StampSnapshot";
export declare class PDFAnnotation extends Userdata<"pdf_annot"> {
    static readonly _drop: (p: Pointer<"pdf_annot">) => void;
    _doc: PDFDocument;
    static readonly ANNOT_TYPES: PDFAnnotationType[];
    static readonly LINE_ENDING: PDFAnnotationLineEndingStyle[];
    static readonly BORDER_STYLE: PDFAnnotationBorderStyle[];
    static readonly BORDER_EFFECT: PDFAnnotationBorderEffect[];
    static readonly INTENT: PDFAnnotationIntent[];
    static readonly IS_INVISIBLE: number;
    static readonly IS_HIDDEN: number;
    static readonly IS_PRINT: number;
    static readonly IS_NO_ZOOM: number;
    static readonly IS_NO_ROTATE: number;
    static readonly IS_NO_VIEW: number;
    static readonly IS_READ_ONLY: number;
    static readonly IS_LOCKED: number;
    static readonly IS_TOGGLE_NO_VIEW: number;
    static readonly IS_LOCKED_CONTENTS: number;
    constructor(doc: PDFDocument, pointer: Pointer<"pdf_annot">);
    getObject(): PDFObject;
    getBounds(): Rect;
    run(device: Device, matrix: Matrix): void;
    toPixmap(matrix: Matrix, colorspace: ColorSpace, alpha?: boolean): Pixmap;
    toDisplayList(): DisplayList;
    update(): boolean;
    getType(): PDFAnnotationType;
    getLanguage(): string;
    setLanguage(lang: string): void;
    getFlags(): number;
    setFlags(flags: number): void;
    getContents(): string;
    setContents(text: string): void;
    getAuthor(): string;
    setAuthor(text: string): void;
    getCreationDate(): Date;
    setCreationDate(date: Date): void;
    getModificationDate(): Date;
    setModificationDate(date: Date): void;
    hasRect(): boolean;
    hasInkList(): boolean;
    hasQuadPoints(): boolean;
    hasVertices(): boolean;
    hasLine(): boolean;
    hasInteriorColor(): boolean;
    hasLineEndingStyles(): boolean;
    hasBorder(): boolean;
    hasBorderEffect(): boolean;
    hasIcon(): boolean;
    hasOpen(): boolean;
    hasAuthor(): boolean;
    hasFilespec(): boolean;
    hasCallout(): boolean;
    getRect(): Rect;
    setRect(rect: Rect): void;
    getPopup(): Rect;
    setPopup(rect: Rect): void;
    getIsOpen(): boolean;
    setIsOpen(isOpen: boolean): void;
    getHiddenForEditing(): boolean;
    setHiddenForEditing(isHidden: boolean): void;
    getIcon(): string;
    setIcon(text: string): void;
    getOpacity(): number;
    setOpacity(opacity: number): void;
    getQuadding(): number;
    setQuadding(quadding: number): void;
    getLine(): Point[];
    setLine(a: Point, b: Point): void;
    getLineEndingStyles(): {
        start: PDFAnnotationLineEndingStyle;
        end: PDFAnnotationLineEndingStyle;
    };
    setLineEndingStyles(start: PDFAnnotationLineEndingStyle, end: PDFAnnotationLineEndingStyle): void;
    getLineCaption(): boolean;
    setLineCaption(on: boolean): void;
    getLineCaptionOffset(): Point;
    setLineCaptionOffset(p: Point): void;
    getLineLeader(): number;
    getLineLeaderExtension(): number;
    getLineLeaderOffset(): number;
    setLineLeader(v: number): void;
    setLineLeaderExtension(v: number): void;
    setLineLeaderOffset(v: number): void;
    getCalloutStyle(): PDFAnnotationLineEndingStyle;
    setCalloutStyle(style: PDFAnnotationLineEndingStyle): void;
    getCalloutLine(): Point[] | undefined;
    setCalloutLine(line: Point[]): void;
    getCalloutPoint(): Point | undefined;
    setCalloutPoint(p: Point): void;
    getColor(): Color;
    getInteriorColor(): Color;
    setColor(color: Color): void;
    setInteriorColor(color: Color): void;
    getBorderWidth(): number;
    setBorderWidth(value: number): void;
    getBorderStyle(): PDFAnnotationBorderStyle;
    setBorderStyle(value: PDFAnnotationBorderStyle): void;
    getBorderEffect(): PDFAnnotationBorderEffect;
    setBorderEffect(value: PDFAnnotationBorderEffect): void;
    getBorderEffectIntensity(): number;
    setBorderEffectIntensity(value: number): void;
    getBorderDashCount(): number;
    getBorderDashItem(idx: number): number;
    clearBorderDash(): void;
    addBorderDashItem(v: number): void;
    getBorderDashPattern(): any[];
    setBorderDashPattern(list: number[]): void;
    getIntent(): PDFAnnotationIntent;
    setIntent(value: PDFAnnotationIntent): void;
    setDefaultAppearance(fontName: string, size: number, color: Color): void;
    getDefaultAppearance(): {
        font: string;
        size: number;
        color: Color;
    };
    getFileSpec(): PDFObject;
    setFileSpec(fs: PDFObject): void;
    getQuadPoints(): Quad[];
    clearQuadPoints(): void;
    addQuadPoint(quad: Quad): void;
    setQuadPoints(quadlist: Quad[]): void;
    getVertices(): Point[];
    clearVertices(): void;
    addVertex(vertex: Point): void;
    setVertices(vertexlist: Point[]): void;
    getInkList(): Point[][];
    clearInkList(): void;
    addInkListStroke(): void;
    addInkListStrokeVertex(v: Point): void;
    setInkList(inklist: Point[][]): void;
    setStampImage(image: Image): void;
    setAppearanceFromDisplayList(appearance: string | null, state: string | null, transform: Matrix, list: DisplayList): void;
    setAppearance(appearance: string | null, state: string | null, transform: Matrix, bbox: Rect, resources: any, contents: AnyBuffer): void;
    applyRedaction(black_boxes?: number, image_method?: number, line_art_method?: number, text_method?: number): void;
}
export declare class PDFWidget extends PDFAnnotation {
    static readonly WIDGET_TYPES: string[];
    static readonly FIELD_IS_READ_ONLY = 1;
    static readonly FIELD_IS_REQUIRED: number;
    static readonly FIELD_IS_NO_EXPORT: number;
    static readonly TX_FIELD_IS_MULTILINE: number;
    static readonly TX_FIELD_IS_PASSWORD: number;
    static readonly TX_FIELD_IS_COMB: number;
    static readonly BTN_FIELD_IS_NO_TOGGLE_TO_OFF: number;
    static readonly BTN_FIELD_IS_RADIO: number;
    static readonly BTN_FIELD_IS_PUSHBUTTON: number;
    static readonly CH_FIELD_IS_COMBO: number;
    static readonly CH_FIELD_IS_EDIT: number;
    static readonly CH_FIELD_IS_SORT: number;
    static readonly CH_FIELD_IS_MULTI_SELECT: number;
    getFieldType(): string;
    isButton(): boolean;
    isPushButton(): boolean;
    isCheckbox(): boolean;
    isRadioButton(): boolean;
    isText(): boolean;
    isChoice(): boolean;
    isListBox(): boolean;
    isComboBox(): boolean;
    getFieldFlags(): number;
    isMultiline(): boolean;
    isPassword(): boolean;
    isComb(): boolean;
    isReadOnly(): boolean;
    getLabel(): string;
    getName(): string;
    getValue(): string;
    setTextValue(value: string): void;
    getMaxLen(): number;
    setChoiceValue(value: string): void;
    getOptions(isExport?: boolean): string[];
    toggle(): void;
}
declare global {
    function $libmupdf_stm_close(ptr: number): void;
    function $libmupdf_stm_seek(ptr: number, pos: number, offset: number, whence: number): number;
    function $libmupdf_stm_read(ptr: number, pos: number, addr: number, size: number): number;
}
interface StreamHandle {
    fileSize(): number;
    read(memory: Uint8Array, offset: number, length: number, position: number): number;
    close(): void;
}
export declare class Stream extends Userdata<"fz_stream"> {
    static readonly _drop: (p: Pointer<"fz_stream">) => void;
    constructor(handle: StreamHandle);
}
declare global {
    function $libmupdf_load_font_file(name: Pointer<"char">, script: Pointer<"char">): Pointer<"fz_buffer">;
}
interface DeviceFunctions {
    drop?(): void;
    close?(): void;
    fillPath?(path: Path, evenOdd: boolean, ctm: Matrix, colorspace: ColorSpace, color: number[], alpha: number): void;
    strokePath?(path: Path, stroke: StrokeState, ctm: Matrix, colorspace: ColorSpace, color: number[], alpha: number): void;
    clipPath?(path: Path, evenOdd: boolean, ctm: Matrix): void;
    clipStrokePath?(path: Path, stroke: StrokeState, ctm: Matrix): void;
    fillText?(text: Text, ctm: Matrix, colorspace: ColorSpace, color: number[], alpha: number): void;
    strokeText?(text: Text, stroke: StrokeState, ctm: Matrix, colorspace: ColorSpace, color: number[], alpha: number): void;
    clipText?(text: Text, ctm: Matrix): void;
    clipStrokeText?(text: Text, stroke: StrokeState, ctm: Matrix): void;
    ignoreText?(text: Text, ctm: Matrix): void;
    fillShade?(shade: Shade, ctm: Matrix, alpha: number): void;
    fillImage?(image: Image, ctm: Matrix, alpha: number): void;
    fillImageMask?(image: Image, ctm: Matrix, colorspace: ColorSpace, color: number[], alpha: number): void;
    clipImageMask?(image: Image, ctm: Matrix): void;
    popClip?(): void;
    beginMask?(bbox: Rect, luminosity: boolean, colorspace: ColorSpace, color: number[]): void;
    endMask?(): void;
    beginGroup?(bbox: Rect, colorspace: ColorSpace, isolated: boolean, knockout: boolean, blendmode: BlendMode, alpha: number): void;
    endGroup?(): void;
    beginTile?(area: Rect, view: Rect, xstep: number, ystep: number, ctm: Matrix, id: number): number;
    endTile?(): void;
    beginLayer?(name: string): void;
    endLayer?(): void;
}
declare global {
    var $libmupdf_path_walk: any;
    var $libmupdf_text_walk: any;
    var $libmupdf_device: any;
}
export {};
