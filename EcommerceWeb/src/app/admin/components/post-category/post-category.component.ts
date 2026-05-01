import { Component } from '@angular/core';
import { FormGroup, FormsModule, Validators } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DemoAngularMaterialModule } from "../../../DemoAngularMaterialModule";
import { Router } from 'express';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-post-category',
  imports: [FormsModule, BrowserAnimationsModule, DemoAngularMaterialModule],
  templateUrl: './post-category.component.html',
  styleUrl: './post-category.component.scss'
})
export class PostCategoryComponent {
    
  categoryForm: FormGroup;

  constructor(
    private fb: FormGroup,
    private router: Router,
    private snackBar: MatSnackBar,
    private adminService: AdminService
  ){}

  ngOnInit(): void{
    this.categoryForm = this.fb.group({
      name: [null, [Validators.required]],
      description: [null, [Validators.required]],
    })
  }

  addCategory():void {
    if(this.categoryForm.valid){
      this.adminService.addCategory(this.categoryForm.value).subscribe((res) =>{
        if (res.id != null) {
          this.snackBar.open('Category Posted Successfully!', 'Close', {
            duration: 5000
          });
          this.router.navigateByUrl('/admin/dashboard');
        }else{
          this.snackBar.open(res.message, 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      })
    }else{
      this.categoryForm.markAllAsTouched();
    }
  }
}
