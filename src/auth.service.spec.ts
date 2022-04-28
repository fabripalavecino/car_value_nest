import { BadRequestException, NotFoundException } from '@nestjs/common';
import  { Test } from '@nestjs/testing';
import { AuthService } from './users/auth.service';
import { User } from './users/user.entity';
import { UsersService } from './users/users.service';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>


beforeEach(async () => {
 // Create a fake copy of the users service
 const users: User[] = []
  fakeUsersService = {
    find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email)
        return Promise.resolve(filteredUsers)
    },
    create: (email:string,password: string) => {
        const user = {id: (Math.floor(Math.random() * 99999)), email, password} as User;

        users.push(user)

        return Promise.resolve(user)
    }
}


const module = await Test.createTestingModule({
    providers: [ AuthService, {
        provide: UsersService,
        useValue: fakeUsersService
    }]
}).compile();

 service = module.get(AuthService);
})


it('can create an instance of auth service', async() => {   
    expect(service).toBeDefined();
});

it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('fabri@test.com' ,'test')

    expect(user.password).not.toEqual('test')
    const [salt,hash] = user.password.split('.');
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
})

it('throws and error if user signs up with email that already in use', async() => {
    await service.signup('fabri@test.com','test')
    
    await expect(service.signup('fabri@test.com','test')).rejects.toThrow(BadRequestException);
    
})

it('throws if signin is called with a unused email', async() => {
    await expect(service.signin('fi@test.com','test')).rejects.toThrowError(NotFoundException)
})

it('throws an error if an invalid password is provided', async() => {
    await service.signup('fabri@test.com','test')

    await expect(
        service.signin('fabri@test.com','password')
    ).rejects.toThrowError(BadRequestException)
})


it('returns a user if correct password is provided', async()=> {
    await service.signup('fabri@test.com','password')

    const user = await service.signin('fabri@test.com','password')

    expect(user).toBeDefined()

    
    
})

})