import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  IframeSrc;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // this.IframeSrc = this.sanitizer.bypassSecurityTrustHtml('/iframeGiftCard')
    this.IframeSrc = '/iframeGiftCard'

  }

}
