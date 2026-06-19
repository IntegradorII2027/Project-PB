describe('Crear producto', () => {
  it('inicia sesión y crea un nuevo producto desde el modal', () => {
    cy.viewport(1280, 800);

    cy.intercept('POST', '**/auth/login').as('loginRequest');

    cy.visit('http://localhost:5173/');

    cy.get('input').first().type('admin@polleria.com');
    cy.get('input').eq(1).type('Admin123!');

    cy.contains('Entrar').click();

    cy.wait('@loginRequest');

    cy.location('pathname').should('eq', '/dashboard');

    cy.contains('a', 'Menú').click();

    cy.location('pathname').should('eq', '/menu');

    cy.contains('Nuevo producto').click();

    cy.contains('label', 'Nombre')
      .parent()
      .find('input')
      .type('Camote frito');

    cy.contains('label', 'Precio')
      .parent()
      .find('input')
      .type('25.90');

    cy.contains('label', 'Categoría')
      .parent()
      .find('select')
      .find('option')
      .eq(1)
      .then((option) => {
        cy.contains('label', 'Categoría')
          .parent()
          .find('select')
          .select(option.val() as string);
      });

    cy.contains('label', 'Tipo')
      .parent()
      .contains('Cocina')
      .find('input[type="radio"]')
      .check({ force: true });

    cy.intercept('GET', '**/api/productos').as('getProductos');

    cy.contains('button', 'Crear producto').click();

    cy.wait('@getProductos');

    cy.contains('h2', 'Nuevo producto').should('not.exist');
    cy.contains(/camote frito/i).should('exist');
  });
});