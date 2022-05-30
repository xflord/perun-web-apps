import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';

export interface AddAuthImgDialogData {
  theme: string;
  attribute: Attribute;
}

const MAX_SIZE = 100;
const MIN_SIZE = 50;
const MAX_LENGTH = 6144;

@Component({
  selector: 'perun-web-apps-add-auth-img-dialog',
  templateUrl: './add-auth-img-dialog.component.html',
  styleUrls: ['./add-auth-img-dialog.component.scss'],
})
export class AddAuthImgDialogComponent implements OnInit {
  theme: string;
  newImage = '';
  attribute: Attribute;
  imgTooLong: boolean;
  imageType: string;

  constructor(
    private dialogRef: MatDialogRef<AddAuthImgDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddAuthImgDialogData,
    private attributesManagerService: AttributesManagerService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.attribute = this.data.attribute;
    this.newImage = this.attribute.value as string;
  }

  handleInputChange(e: InputEvent): void {
    const file = e.dataTransfer?.files[0] ?? (e.target as HTMLInputElement)?.files[0];
    const pattern = /image-*/;
    const reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
    reader.onload = this._handleReaderLoaded.bind(this) as () => void;
    this.imageType = file.type;
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(event: ProgressEvent): void {
    const reader: FileReader = event.target as FileReader;
    let size = MAX_SIZE;
    const compressRecursive = (): void => {
      compressImage(reader.result as string)
        .then((compressed) => {
          if (size > MIN_SIZE && compressed.length > MAX_LENGTH) {
            size -= 10;
            compressRecursive();
          } else {
            this.newImage = compressed;
            this.imgTooLong = this.newImage.length >= MAX_LENGTH;
          }
        })
        .catch((error) => console.error(error));
    };

    const compressImage = (src: string): Promise<string> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.src = src;
        img.onload = (): void => {
          const elem = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > size) {
              height *= size / width;
              width = size;
            }
          } else if (height > size) {
            width *= size / height;
            height = size;
          }
          elem.width = width;
          elem.height = height;
          const ctx = elem.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const data = ctx.canvas.toDataURL();
          res(data);
        };
        img.onerror = (error): void => rej(error);
      });

    compressRecursive();
  }

  onAdd(): void {
    this.attribute.value = this.newImage;
    this.attributesManagerService
      .setUserAttribute({
        attribute: this.attribute,
        user: this.store.getPerunPrincipal().userId,
      })
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  generateImg(): void {
    const MAX_COLOR = 200; // Max value for a color component
    const MIN_COLOR = 120; // Min value for a color component
    const FILL_CHANCE = 0.5; // Chance of a square being filled [0, 1]
    const SQUARE = 20; // Size of a grid square in pixels
    const GRID = MAX_SIZE / SQUARE; // Number of squares width and height
    const FILL_COLOR = '#FFFFFF'; // canvas background color

    /* Create a temporary canvas */
    function setupCanvas(): HTMLCanvasElement {
      const canvas = document.createElement('canvas');
      canvas.width = MAX_SIZE;
      canvas.height = MAX_SIZE;

      // Fill canvas background
      const context = canvas.getContext('2d');
      context.beginPath();
      context.rect(0, 0, MAX_SIZE, MAX_SIZE);
      context.fillStyle = FILL_COLOR;
      context.fill();
      return canvas;
    }

    function fillBlock(
      x: number,
      y: number,
      color: number[],
      context: CanvasRenderingContext2D
    ): void {
      context.beginPath();
      context.rect(x * SQUARE, y * SQUARE, SQUARE, SQUARE);
      context.fillStyle = 'rgb(' + color.join(',') + ')';
      context.fill();
    }

    function generateColor(): number[] {
      const rgb: number[] = [];
      for (let i = 0; i < 3; i++) {
        const val = Math.floor(Math.random() * 256);
        const minEnforced = Math.max(MIN_COLOR, val);
        const maxEnforced = Math.min(MAX_COLOR, minEnforced);
        rgb.push(maxEnforced);
      }
      return rgb;
    }

    function generateImage(): string {
      const canvas = setupCanvas();
      const context = canvas.getContext('2d');
      const color = generateColor();

      for (let x = 0; x < Math.ceil(GRID); x++) {
        for (let y = 0; y < GRID; y++) {
          // Randomly fill squares
          if (Math.random() < FILL_CHANCE) {
            fillBlock(x, y, color, context);
          }
        }
      }
      return canvas.toDataURL('image/png');
    }

    this.newImage = generateImage();
    this.imgTooLong = false;
  }
}
