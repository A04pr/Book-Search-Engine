import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import { GET_ME, SAVE_BOOK } from '../utils/mutations'; 
import { searchGoogleBooks } from '../utils/API'; 
import Auth from '../utils/auth';

const SearchBooks = () => {
  const { loading: meLoading, data: meData } = useQuery(GET_ME);
  const [searchInput, setSearchInput] = useState('');
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [saveBook] = useMutation(SAVE_BOOK);
  const savedBookIds = meData?.me?.savedBooks?.map(book => book.bookId) || [];

  useEffect(() => {
    if (searchInput.trim() !== '') {
      searchGoogleBooks(searchInput)
        .then((data) => {
          setSearchedBooks(data.items.map(book => ({
            bookId: book.id,
            authors: book.volumeInfo.authors || ['No author to display'],
            title: book.volumeInfo.title,
            description: book.volumeInfo.description,
            image: book.volumeInfo.imageLinks?.thumbnail || ''
          })));
        })
        .catch((error) => {
          console.error('Error searching books:', error);
          setSearchedBooks([]);
        });
    } else {
      setSearchedBooks([]);
    }
  }, [searchInput]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  const handleSaveBook = async (bookId) => {
    const savedBook = searchedBooks.find((book) => book.bookId === bookId);

    try {
      await saveBook({
        variables: { bookData: { ...savedBook } }
      });

      setSearchedBooks(prevBooks => prevBooks.filter(book => book.bookId !== bookId)); // Remove the saved book from the search results
    } catch (err) {
      console.error(err);
    }
  };

  if (meLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border='dark'>
                {book.image ? (
                  <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds.includes(book.bookId)}
                      className='btn-block btn-info'
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds.includes(book.bookId)
                        ? 'This book has already been saved!'
                        : 'Save this Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;