import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {assert, expect} from "chai";
import {BigNumber} from "ethers";
import {network, ethers} from "hardhat";
import {developmentChains} from "../helper-hardhat-config";
import {
  ERC20Mock,
  HolderValidation,
  MrCryptoNFT,
  Project,
  RacksProjectManager,
} from "../types/contracts";
import {deployDevChain} from "../utils/deployments/deployDevChain";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Racks Project Manager Unit Tests", function () {
      let racksPM: RacksProjectManager,
        mrc: MrCryptoNFT,
        erc20: ERC20Mock,
        deployer: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress,
        project1: Project,
        holderValidation: HolderValidation;

      const startUp = async () => {
        [deployer, user1, user2] = await ethers.getSigners();

        const {
          MrCryptoNFT,
          MockErc20,
          RacksPM,
          TransparentUpgradeableProxy,
          HolderValidation,
        } = await deployDevChain();

        // await deployments.fixture(["rackspm", "mocks", "proxy"]);

        // const mrcContract = await ethers.getContract("MRCRYPTO");
        mrc = MrCryptoNFT;

        // const erc20Contract = await ethers.getContract("MockErc20");
        erc20 = MockErc20;
        // const holderValContract = await ethers.getContract("HolderValidation");
        holderValidation = HolderValidation;

        // const Proxy = await ethers.getContract("TransparentUpgradeableProxy");
        // const RacksPMContract = await ethers.getContract("RacksProjectManager");
        const ProxyImplementation = RacksPM.attach(
          TransparentUpgradeableProxy.address,
        );
        racksPM = ProxyImplementation.connect(deployer);

        const tx = await racksPM.createProject(
          "Project1",
          ethers.utils.parseEther("100"),
          1,
          2,
        );

        await tx.wait();

        const events = await racksPM.queryFilter(
          racksPM.filters.newProjectCreated(),
        );

        const lastEvent = events.sort(
          (a, b) => b.blockNumber - a.blockNumber,
        )[0];

        const newProjectAddress = lastEvent.args.newProjectAddress;

        project1 = await ethers.getContractAt("Project", newProjectAddress);
        project1 = project1.connect(deployer);
        await project1.approveProject();
      };

      beforeEach(async () => await loadFixture(startUp));

      describe("Setup", () => {
        it("Should mint ERC20 and MRC", async () => {
          let balanceOf = await erc20.balanceOf(deployer.address);

          expect(balanceOf).to.be.equal(ethers.utils.parseEther("10000"));

          await erc20.connect(user1).mintMore();
          balanceOf = await erc20.balanceOf(user1.address);
          expect(balanceOf).to.be.equal(ethers.utils.parseEther("10000"));

          await mrc.connect(user1).mint(1);

          expect(await mrc.balanceOf(user1.address)).to.deep.equal(
            BigNumber.from(1),
          );
        });
      });

      describe("Create Project", () => {
        it("Should revert with adminErr", async () => {
          await expect(
            racksPM
              .connect(user1)
              .createProject("Project2", ethers.utils.parseEther("100"), 1, 2),
          ).to.be.revertedWithCustomError(racksPM, "adminErr");
        });

        it("Should revert with projectInvalidParameterErr", async () => {
          await expect(
            racksPM.createProject(
              "Project2",
              ethers.utils.parseEther("100"),
              0,
              2,
            ),
          ).to.be.revertedWithCustomError(
            racksPM,
            "projectInvalidParameterErr",
          );

          await expect(
            racksPM.createProject(
              "Project2",
              ethers.utils.parseEther("100"),
              1,
              0,
            ),
          ).to.be.revertedWithCustomError(
            racksPM,
            "projectInvalidParameterErr",
          );

          await expect(
            racksPM.createProject("", ethers.utils.parseEther("100"), 1, 3),
          ).to.be.revertedWithCustomError(
            racksPM,
            "projectInvalidParameterErr",
          );
        });

        it("Should create project and then deleted correctly", async () => {
          await racksPM.addAdmin(user1.address);
          expect(await racksPM.isAdmin(user1.address)).to.be.true;
          expect(await racksPM.isAdmin(user2.address)).to.be.false;

          const tx = await racksPM
            .connect(user1)
            .createProject("Project2", ethers.utils.parseEther("100"), 1, 2);

          await tx.wait();

          const events = await racksPM.queryFilter(
            racksPM.filters.newProjectCreated(),
          );

          const lastEvent = events.sort(
            (a, b) => b.blockNumber - a.blockNumber,
          )[0];

          const project2Address = lastEvent.args.newProjectAddress;

          const project2 = await ethers.getContractAt(
            "Project",
            project2Address,
          );
          await project2.approveProject();

          assert.lengthOf(await racksPM.getProjects(), 2);

          await racksPM.removeAdmin(user1.address);
          await expect(
            racksPM
              .connect(user1)
              .createProject("Project3", ethers.utils.parseEther("100"), 1, 2),
          ).to.be.revertedWithCustomError(racksPM, "adminErr");

          let projects = await racksPM.getProjects();
          expect(projects).to.have.same.members([
            project1.address,
            project2.address,
          ]);

          expect(await project2.isActive()).to.be.true;
          expect(await project2.isDeleted()).to.be.false;

          await mrc.connect(user1).mint(1);
          await erc20.connect(user1).mintMore();
          await racksPM.connect(user1).registerContributor();
          await erc20
            .connect(user1)
            .approve(project2.address, ethers.utils.parseEther("100"));
          await project2.connect(user1).registerProjectContributor();

          await erc20.connect(user2).mintMore();
          await erc20
            .connect(user2)
            .approve(project2.address, ethers.utils.parseEther("500"));
          const fundTx = await project2
            .connect(user2)
            .fundProject(ethers.utils.parseEther("500"));

          expect(await project2.getAccountFunds(user2.address)).to.be.equal(
            ethers.utils.parseEther("500"),
          );
          expect(await project2.getTotalAmountFunded()).to.be.equal(
            ethers.utils.parseEther("500"),
          );
          const balanceBefore = await erc20.balanceOf(user2.address);
          expect(balanceBefore).to.be.equal(ethers.utils.parseEther("9500"));

          await project2.removeContributor(user1.address, true);

          await fundTx.wait();

          await project2.deleteProject();

          expect(await project2.getAccountFunds(user2.address)).to.be.equal(
            ethers.utils.parseEther("0"),
          );
          expect(await project2.getTotalAmountFunded()).to.be.equal(
            ethers.utils.parseEther("0"),
          );
          const balanceAfter = await erc20.balanceOf(user2.address);
          expect(balanceAfter).to.be.equal(ethers.utils.parseEther("10000"));

          expect(await project2.isActive()).to.be.false;
          expect(await project2.isDeleted()).to.be.true;

          projects = await racksPM.getProjects();
          expect(projects).to.have.same.members([project1.address]);

          await racksPM.createProject(
            "Project3",
            ethers.utils.parseEther("0"),
            1,
            2,
          );
        });

        it("Should revert if the smart contract is paused", async () => {
          await racksPM.setIsPaused(true);

          await racksPM.addAdmin(user1.address);
          await expect(
            racksPM
              .connect(user1)
              .createProject("Project2", ethers.utils.parseEther("100"), 1, 2),
          ).to.be.revertedWithCustomError(racksPM, "pausedErr");
        });
      });

      describe("Register Contributor", () => {
        it("Should revert with holderErr", async () => {
          await expect(
            racksPM.connect(user1).registerContributor(),
          ).to.be.revertedWithCustomError(racksPM, "holderErr");
        });

        it("Should revert with contributorAlreadyExistsErr", async () => {
          await mrc.connect(user1).mint(1);
          await racksPM.connect(user1).registerContributor();
          await expect(
            racksPM.connect(user1).registerContributor(),
          ).to.be.revertedWithCustomError(
            racksPM,
            "contributorAlreadyExistsErr",
          );
        });

        it("Should register Contributor", async () => {
          await mrc.connect(user1).mint(1);
          await racksPM.connect(user1).registerContributor();
          const contributor = await racksPM.connect(user1).getContributor(0);
          assert(contributor.wallet == user1.address);
          expect(await racksPM.getNumberOfContributors()).to.deep.equal(1);
        });

        it("Should revert if the smart contract is paused", async () => {
          await racksPM.setIsPaused(true);

          await mrc.connect(user1).mint(1);
          await expect(
            racksPM.connect(user1).registerContributor(),
          ).to.be.revertedWithCustomError(racksPM, "pausedErr");
        });
      });

      describe("List Projects according to Contributor Level", () => {
        it("Should revert if it is not Holder and it is not Admin", async () => {
          await expect(
            racksPM.connect(user1).getProjects(),
          ).to.be.revertedWithCustomError(racksPM, "holderErr");
        });

        it("Should retieve only Lv1 Projects called by a Holder", async () => {
          await racksPM.createProject(
            "Project2",
            ethers.utils.parseEther("100"),
            2,
            2,
          );
          await racksPM.createProject(
            "Project3",
            ethers.utils.parseEther("100"),
            3,
            2,
          );

          await mrc.connect(user1).mint(1);
          const projects = await racksPM.connect(user1).getProjects();
          assert.lengthOf(
            projects.filter((p) => p !== ethers.constants.AddressZero),
            1,
          );
        });

        it("Should retrieve only Lv2 or less Projects called by a Contributor", async () => {
          await racksPM.createProject(
            "Project2",
            ethers.utils.parseEther("100"),
            2,
            2,
          );
          await racksPM.createProject(
            "Project3",
            ethers.utils.parseEther("100"),
            3,
            2,
          );

          await mrc.connect(user1).mint(1);
          await racksPM.connect(user1).registerContributor();

          // set level of contributor to lvl 2
          await racksPM.setAccountToContributorData(user1.address, {
            banned: false,
            reputationLevel: 2,
            reputationPoints: 0,
            wallet: user1.address,
          });

          const projects = await racksPM.connect(user1).getProjects();
          assert.lengthOf(
            projects.filter((p) => p !== ethers.constants.AddressZero),
            2,
          );
        });

        it("Should retrieve all Projects called by an Admin", async () => {
          await racksPM.createProject(
            "Project2",
            ethers.utils.parseEther("100"),
            2,
            2,
          );
          await racksPM.createProject(
            "Project3",
            ethers.utils.parseEther("100"),
            3,
            2,
          );

          const projects = await racksPM.getProjects();
          assert.lengthOf(
            projects.filter((p) => p !== ethers.constants.AddressZero),
            3,
          );
        });
      });

      describe("Holder Validation", () => {
        it("Add Collection Should revert with Ownable Error", async () => {
          await expect(
            holderValidation.connect(user1).addCollection(mrc.address),
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Delete Collection Should revert with Ownable Error", async () => {
          await expect(
            holderValidation.connect(user1).deleteCollection(mrc.address),
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should add collection succesfully", async () => {
          await holderValidation.addCollection(user1.address);
          assert.lengthOf(await holderValidation.getAllCollections(), 2);
        });

        it("Should delete 1 collection succesfully", async () => {
          await holderValidation.deleteCollection(mrc.address);
          assert.lengthOf(await holderValidation.getAllCollections(), 0);
        });

        it("Should delete collections succesfully", async () => {
          await holderValidation.addCollection(user1.address);
          await holderValidation.deleteCollection(user1.address);
          assert.lengthOf(await holderValidation.getAllCollections(), 1);
          await holderValidation.deleteCollection(mrc.address);
          assert.lengthOf(await holderValidation.getAllCollections(), 0);
        });

        it("Should return false if User is not a holder", async () => {
          expect(await holderValidation.isHolder(user1.address)).to.be.equal(
            ethers.constants.AddressZero,
          );
        });

        it("Should return true if User is a holder", async () => {
          await mrc.connect(user1).mint(1);
          expect(
            await holderValidation.isHolder(user1.address),
          ).to.not.be.equal(ethers.constants.AddressZero);
        });
      });
    });
