import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, REMOVE_BOOK } from '../utils/mutations';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { removeBookId } from '../utils/localStorage';
import Auth from '../utils/auth';

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  const userData = data?.me || {};

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
        update: (cache) => {
          const existingData = cache.readQuery({ query: GET_ME });
          const updatedBooks = existingData.me.savedBooks.filter(
            (book) => book.bookId !== bookId
          );
          cache.writeQuery({
            query: GET_ME,
            data: { me: { ...existingData.me, savedBooks: updatedBooks } },
          });
        },
      });

      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <h2>
        {userData.savedBooks?.length
          ? `Viewing ${userData.savedBooks.length} saved ${
              userData.savedBooks.length > 1 ? 'books' : 'book'
            }`
          : 'No saved books'}
      </h2>
      <Row xs={1} md={2} lg={3} className="g-3">
        {userData.savedBooks?.map((book) => (
          <Col key={book.bookId}>
            <Card>
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <Card.Text>Author: {book.authors.join(', ')}</Card.Text>
                <Card.Text>{book.description}</Card.Text>
                {book.image && (
                  <Card.Img src={book.image} alt={`Cover of ${book.title}`} />
                )}
                {book.link && (
                  <Button variant="primary" href={book.link} target="_blank">
                    View on Google Books
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={() => handleDeleteBook(book.bookId)}
                >
                  Delete from saved
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SavedBooks;