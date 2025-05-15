import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HangmanService } from './hangman.service';
import { Hangman } from '../../../domain/model/hangman/hangman';

describe('HangmanService', () => {
  let service: HangmanService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HangmanService],
    });
    service = TestBed.inject(HangmanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all hangman games', () => {
    const mockHangmanList: Hangman[] = [
      { Id: 1, GameInstanceId: 101, Word: 'test', Clue: 'clue1', Presentation: 'presentation1' },
      { Id: 2, GameInstanceId: 102, Word: 'example', Clue: 'clue2', Presentation: 'presentation2' },
    ];

    service.getAllHangman().subscribe((hangmanList) => {
      expect(hangmanList.length).toBe(2);
      expect(hangmanList).toEqual(mockHangmanList);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHangmanList);
  });

  it('should fetch a hangman game by ID', () => {
    const mockHangman: Hangman = { Id: 1, GameInstanceId: 101, Word: 'test', Clue: 'clue1', Presentation: 'presentation1' };

    service.getHangmanById(1).subscribe((hangman) => {
      expect(hangman).toEqual(mockHangman);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHangman);
  });

  it('should create a new hangman game', () => {
    const newHangman: Hangman = { Id: 3, GameInstanceId: 103, Word: 'new', Clue: 'clue3', Presentation: 'presentation3' };

    service.createHangman(newHangman).subscribe((hangman) => {
      expect(hangman).toEqual(newHangman);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}`);
    expect(req.request.method).toBe('POST');
    req.flush(newHangman);
  });

  it('should update an existing hangman game', () => {
    const updatedHangman: Hangman = { Id: 1, GameInstanceId: 101, Word: 'updated', Clue: 'updatedClue', Presentation: 'updatedPresentation' };

    service.updateHangman(1, updatedHangman).subscribe((hangman) => {
      expect(hangman).toEqual(updatedHangman);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedHangman);
  });

  it('should delete a hangman game', () => {
    service.deleteHangman(1).subscribe((response) => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
