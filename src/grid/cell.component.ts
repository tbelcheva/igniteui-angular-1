import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    TemplateRef
} from "@angular/core";
import { DataType } from "../data-operations/data-util";
import { IgxGridAPIService } from "./api.service";
import { IgxColumnComponent } from "./column.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "igx-grid-cell",
    templateUrl: "./cell.component.html",
    preserveWhitespaces: false
})
export class IgxGridCellComponent {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public row: any;

    @Input()
    public cellTemplate: TemplateRef<any>;

    @Input()
    get value(): any {
        return this._value;
    }

    set value(val: any) {
        this._value = val;
        this.gridAPI.update(this.gridID, this);
        this.cdr.markForCheck();
    }

    get formatter(): (value: any) => any {
        return this.column.formatter;
    }

    get context(): any {
        return {
            $implicit: this.value,
            cell: this
        };
    }

    get gridID(): any {
      return this.row.gridID;
    }

    get grid(): any {
        return this.gridAPI.get(this.gridID);
    }

    get rowIndex(): number {
        return this.row.index;
    }

    get columnIndex(): number {
        return this.column.index;
    }

    @HostBinding("attr.tabindex")
    public tabindex = 0;

    @HostBinding("attr.role")
    public role = "gridcell";

    @HostBinding("attr.aria-readonly")
    get readonly(): boolean {
        return !this.column.editable;
    }

    @HostBinding("attr.aria-describedby")
    get describedby(): string {
        return `${this.row.gridID}-${this.column.field}`;
    }

    @HostBinding("class")
    get styleClasses(): string {
        return `${this.defaultCssClass} ${this.column.cellClasses}`;
    }

    @HostBinding("style.min-width")
    get width() {
        return this.column.width;
    }

    @HostBinding("attr.aria-selected")
    @HostBinding("class.igx-grid__td--selected")
    get focused(): boolean {
        return this.isFocused || this.isSelected;
    }

    set focused(val: boolean) {
        this.isFocused = val;
        this.cdr.markForCheck();
    }

    @HostBinding("class.igx-grid__td--number")
    get applyNumberCSSClass() {
        return this.column.dataType === DataType.Number;
    }

    get selected() {
        return this.isSelected;
    }

    set selected(val: boolean) {
        this.isSelected = val;
        this.cdr.markForCheck();
    }

    protected defaultCssClass = "igx-grid__td";
    protected isFocused = false;
    protected isSelected = false;
    protected _value: any;

    constructor(private gridAPI: IgxGridAPIService,
                private cdr: ChangeDetectorRef,
                private element: ElementRef) {}

    @HostListener("focus", ["$event"])
    public onFocus(event) {
        this.isFocused = true;
        this.isSelected = true;
        this.grid.onSelection.emit(this);
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        this.isFocused = false;
        this.isSelected = false;
    }

    @HostListener("keydown", ["$event"])
    public onKeyDown(event) {

        const handleKeyboardNavigation = (rowIndex, columnIndex) => {
            target = this.gridAPI.get_cell_by_index(this.gridID, rowIndex, columnIndex);
            if (target) {
                target.element.nativeElement.focus();
            }
        };

        const key = event.key;
        let target;

        if (key.endsWith("ArrowUp")) {
            handleKeyboardNavigation(this.rowIndex - 1, this.columnIndex);
        } else if (key.endsWith("ArrowDown")) {
            handleKeyboardNavigation(this.rowIndex + 1, this.columnIndex);
        } else if (key.endsWith("Right")) {
            handleKeyboardNavigation(this.rowIndex, this.columnIndex + 1);
        } else if (key.endsWith("Left")) {
            handleKeyboardNavigation(this.rowIndex, this.columnIndex - 1);
        }
    }
}