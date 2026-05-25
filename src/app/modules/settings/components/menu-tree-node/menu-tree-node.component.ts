import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuItem } from '../../../../core/models/menu.model';


@Component({
  selector: 'app-menu-tree-node',
  standalone: true,
  imports: [CommonModule, FormsModule,DragDropModule], // DragDropModule is here
  templateUrl: './menu-tree-node.component.html',
  styleUrls: ['./menu-tree-node.component.scss']
})
export class MenuTreeNodeComponent {
  @Input() menuItem!: MenuItem;
  @Input() isSelected = false;
  @Output() select = new EventEmitter<MenuItem>();
  @Output() edit = new EventEmitter<MenuItem>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggleStatus = new EventEmitter<MenuItem>();
  @Input() isChildExpanded = false;

  onSelect(): void {
    this.select.emit(this.menuItem);
  }

  onEdit(): void {
    this.edit.emit(this.menuItem);
  }

  onDelete(): void {
    this.delete.emit(this.menuItem.menuItemId);
  }

  onToggleStatus(): void {
    this.toggleStatus.emit(this.menuItem);
  }

  onChildDrop(event: CdkDragDrop<MenuItem[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // Emit the parent item to trigger save
    this.edit.emit(this.menuItem);
  }

  isChildSelected(child: MenuItem): boolean {
    return false; // This will be handled by parent component
  }

  onChildSelect(child: MenuItem): void {
    this.select.emit(child);
  }

  onEditChild(child: MenuItem): void {
    this.edit.emit(child);
  }

  onDeleteChild(childId: number): void {
    this.delete.emit(childId);
  }

  onToggleChildStatus(child: MenuItem): void {
    this.toggleStatus.emit(child);
  }
}
