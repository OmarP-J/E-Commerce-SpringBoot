import { Component } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DemoAngularMaterialModule } from "../../../DemoAngularMaterialModule";
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-post-product',
  imports: [BrowserAnimationsModule, DemoAngularMaterialModule],
  templateUrl: './post-product.component.html',
  styleUrl: './post-product.component.scss'
})
export class PostProductComponent {

  productForm: FormGroup;
  listOfCategories: any[] = [];
  selectedFiles: File | null;
  imagePreview: string | ArrayBuffer | null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private adminService: AdminService
  ){}

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files[0];
    this.previewImage();
  }

  previewImage(): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    }
    reader.readAsDataURL(this.selectedFiles!);
  }

  ngOnInit(): void{
    this.productForm = this.fb.group({
      categoryId: [null, [Validators.required]],
      name: [null, [Validators.required]],
      price: [null, [Validators.required]],
      drescription: [null, [Validators.required]],
    })

    this.getAllCategories();
  }

  getAllCategories() {
    this.adminService.getAllCategories().subscribe(res=>{
        this.listOfCategories = res;
      })
    }

  addProduct():void {
    if(this.productForm.valid){
      const formData: FormData = new FormData();
      formData.append('img', this.selectedFiles);
      formData.append('categoryId', this.productForm.get('categoryId').value);
      formData.append('name', this.productForm.get('name').value);
      formData.append('description', this.productForm.get('description').value);
      formData.append('price', this.productForm.get('price').value);

      this.adminService.addProduct(formData).subscribe(res=>{
        if (res.id != null) {
          this.snackBar.open('Product Posted Successfully!', 'Close', {
            duration: 5000
          });
          this.router.navigateByUrl('/admin/dashboard');
        }else{
          this.snackBar.open(res.message, 'ERROR', {
            duration: 5000
          });
        }
      });
    }else{
      for (const i in this.productForm.controls) {
        this.productForm.controls[i].markAsTouched();
        this.productForm.controls[i].updateValueAndValidity();
      }
    }
  }
